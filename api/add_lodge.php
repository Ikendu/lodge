<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/config.php';

$dbClass = new Database();
$pdo = $dbClass->connect();

function clean($v) {
    return htmlspecialchars(strip_tags(trim($v)));
}

/**
 * Compress and save an uploaded image to target directory ensuring it is not larger than $maxKB.
 * Supports JPEG and PNG input; PNGs are converted to JPEG to improve compression.
 * Returns saved filename on success or null on failure.
 */
function save_compressed_image($tmpPath, $origName, $uploadDir, $nin, $id, $suffix, $respLog, $maxKB = 500) {
    $info = @getimagesize($tmpPath);
    if ($info === false) {
        error_log("save_compressed_image: not an image: $origName\n", 3, $respLog);
        return null;
    }

    $mime = $info['mime'] ?? '';
    $width = $info[0] ?? 0;
    $height = $info[1] ?? 0;

    // If the uploaded file is already small enough, keep original file (preserve extension)
    $origExt = strtolower(pathinfo($origName, PATHINFO_EXTENSION)) ?: 'jpg';
    $maxBytes = $maxKB * 1024;
    if (file_exists($tmpPath) && filesize($tmpPath) <= $maxBytes) {
        // preserve extension if allowed (jpg/jpeg/png), otherwise fallback to jpg
        $targetExt = in_array($origExt, ['jpg','jpeg','png']) ? $origExt : 'jpg';
        $targetName = $nin . '_' . $id . '_' . $suffix . '_' . time() . '.' . $targetExt;
        $targetPath = $uploadDir . $targetName;
        // try to move uploaded file; if that fails, try copy as fallback
        if (@move_uploaded_file($tmpPath, $targetPath) || @copy($tmpPath, $targetPath)) {
            return $targetName;
        } else {
            error_log("save_compressed_image: failed to move/copy small file $origName to $targetPath\n", 3, $respLog);
            // continue to normal processing below (attempt compression)
        }
    }

    // Prepare a workable image resource (convert PNG to truecolor to remove alpha)
    $src = null;
    if ($mime === 'image/jpeg' || $mime === 'image/pjpeg') {
        $src = @imagecreatefromjpeg($tmpPath);
        $targetExt = 'jpg';
    } elseif ($mime === 'image/png') {
        $png = @imagecreatefrompng($tmpPath);
        if ($png === false) {
            error_log("save_compressed_image: failed to createfrompng for $origName\n", 3, $respLog);
            return null;
        }
        // create truecolor canvas and copy to remove alpha channel (use white background)
        $canvas = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefilledrectangle($canvas, 0, 0, $width, $height, $white);
        imagecopy($canvas, $png, 0, 0, 0, 0, $width, $height);
        imagedestroy($png);
        $src = $canvas;
        $targetExt = 'jpg';
    } else {
        error_log("save_compressed_image: unsupported mime $mime for $origName\n", 3, $respLog);
        return null;
    }

    if ($src === false || $src === null) {
        error_log("save_compressed_image: could not create image resource for $origName\n", 3, $respLog);
        return null;
    }

    // limit max dimension to avoid extremely large images (scale down if necessary)
    $maxDim = 2000; // pixels
    $scale = 1.0;
    if ($width > $maxDim || $height > $maxDim) {
        $scale = $maxDim / max($width, $height);
        $newW = max(1, intval($width * $scale));
        $newH = max(1, intval($height * $scale));
        $resized = imagescale($src, $newW, $newH, IMG_BILINEAR_FIXED);
        imagedestroy($src);
        $src = $resized;
    }

    // build base target name (extension will be $targetExt)
    $targetName = $nin . '_' . $id . '_' . $suffix . '_' . time() . '.' . $targetExt;
    $targetPath = $uploadDir . $targetName;

    // try decreasing JPEG quality until filesize <= maxKB or quality gets low
    $maxBytes = $maxKB * 1024;
    $qualities = [90, 80, 70, 60, 50, 40];
    foreach ($qualities as $q) {
        // write to target path
        if (@imagejpeg($src, $targetPath, $q) === false) {
            error_log("save_compressed_image: imagejpeg failed for $origName at q=$q\n", 3, $respLog);
            continue;
        }
        clearstatcache(true, $targetPath);
        $size = filesize($targetPath) ?: 0;
        if ($size <= $maxBytes) {
            imagedestroy($src);
            return $targetName;
        }
    }

    // If still too large, iteratively downscale dimensions and save with moderate quality
    $currentW = imagesx($src);
    $currentH = imagesy($src);
    while (($currentW > 300 || $currentH > 300)) {
        $currentW = max(300, intval($currentW * 0.85));
        $currentH = max(300, intval($currentH * 0.85));
        $tmpRes = imagescale($src, $currentW, $currentH, IMG_BILINEAR_FIXED);
        imagedestroy($src);
        $src = $tmpRes;
        if (@imagejpeg($src, $targetPath, 60) === false) {
            error_log("save_compressed_image: imagejpeg failed during downscale for $origName\n", 3, $respLog);
            break;
        }
        clearstatcache(true, $targetPath);
        $size = filesize($targetPath) ?: 0;
        if ($size <= $maxBytes) {
            imagedestroy($src);
            return $targetName;
        }
    }

    // final attempt with low quality
    @imagejpeg($src, $targetPath, 40);
    clearstatcache(true, $targetPath);
    if (filesize($targetPath) <= $maxBytes) {
        imagedestroy($src);
        return $targetName;
    }

    // give up
    imagedestroy($src);
    error_log("save_compressed_image: could not get $origName under {$maxKB}KB, final size=" . (filesize($targetPath) ?: 0) . "\n", 3, $respLog);
    return null;
}

$respLog = __DIR__ . '/lodge_upload_debug.log';

try {
    // Expect form-data with fields: title, location, price, type, description,
    // amenities, capacity, bathroomType, nin (required), optional userUid, userLoginMail
    $nin = isset($_POST['nin']) ? clean($_POST['nin']) : '';
    if (empty($nin)) {
        echo json_encode(["success" => false, "message" => "NIN is required"]);
        exit;
    }

    $title = clean($_POST['title'] ?? '');
    $location = clean($_POST['location'] ?? '');
    $price = clean($_POST['price'] ?? '');
    $type = clean($_POST['type'] ?? '');
    $description = clean($_POST['description'] ?? '');
    $amenities = clean($_POST['amenities'] ?? '');
    $capacity = clean($_POST['capacity'] ?? '');
    $bathroomType = clean($_POST['bathroomType'] ?? '');
    $userUid = clean($_POST['userUid'] ?? '');
    $userLoginMail = clean($_POST['userLoginMail'] ?? '');

    // prepare lodgefiles folder
    $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'lodgefiles' . DIRECTORY_SEPARATOR;
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0775, true)) {
            error_log("Failed to create lodgefiles dir: $uploadDir\n", 3, $respLog);
            echo json_encode(["success" => false, "message" => "Server error: cannot create upload directory"]);
            exit;
        }
    }

    $allowedExt = ['jpg','jpeg','png'];

    $saved = [
        'image_first' => null,
        'image_second' => null,
        'image_third' => null,
    ];

    // map incoming file keys to target suffixes
    $map = [
        'image1' => 'first',
        'image2' => 'second',
        'image3' => 'third',
    ];

    // First insert a record with empty image fields so we have an ID to reference
    $sql = "INSERT INTO lodges (
        userUid, userLoginMail, nin, title, location, price, type, description,
        amenities, capacity, bathroomType, image_first, image_second, image_third, created_at
    ) VALUES (
        :userUid, :userLoginMail, :nin, :title, :location, :price, :type, :description,
        :amenities, :capacity, :bathroomType, '', '', '', NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':userUid', $userUid);
    $stmt->bindValue(':userLoginMail', $userLoginMail);
    $stmt->bindValue(':nin', $nin);
    $stmt->bindValue(':title', $title);
    $stmt->bindValue(':location', $location);
    $stmt->bindValue(':price', $price);
    $stmt->bindValue(':type', $type);
    $stmt->bindValue(':description', $description);
    $stmt->bindValue(':amenities', $amenities);
    $stmt->bindValue(':capacity', $capacity);
    $stmt->bindValue(':bathroomType', $bathroomType);

    if (!$stmt->execute()) {
        echo json_encode(["success" => false, "message" => "Failed to create lodge record"]);
        exit;
    }

    $id = $pdo->lastInsertId();

    // move uploaded files (compress them first) and name them using the new DB id to avoid overwrites
    foreach ($map as $key => $suffix) {
        if (!empty($_FILES[$key]) && isset($_FILES[$key]['tmp_name']) && $_FILES[$key]['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES[$key]['tmp_name'];
            $origName = $_FILES[$key]['name'] ?? 'upload';
            $check = @getimagesize($tmp);
            if ($check === false) {
                error_log("Uploaded file $origName is not a valid image\n", 3, $respLog);
                continue;
            }
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION)) ?: 'jpg';
            if (!in_array($ext, $allowedExt)) {
                error_log("Extension not allowed for $origName: $ext\n", 3, $respLog);
                continue;
            }

            // compress and save (PNG will be converted to JPG). The helper will pick a unique filename.
            $compressedName = save_compressed_image($tmp, $origName, $uploadDir, $nin, $id, $suffix, $respLog, 500);
            if ($compressedName) {
                $saved['image_' . $suffix] = $compressedName;
                error_log("Saved (compressed) lodge file to: " . $uploadDir . $compressedName . "\n", 3, $respLog);
            } else {
                error_log("Failed to compress/save uploaded file: $origName\n", 3, $respLog);
            }
        }
    }

    // Update the lodge record with the saved filenames (if any)
    $updateSql = "UPDATE lodges SET image_first = :image_first, image_second = :image_second, image_third = :image_third WHERE id = :id";
    $uStmt = $pdo->prepare($updateSql);
    $uStmt->bindValue(':image_first', $saved['image_first'] ?? '');
    $uStmt->bindValue(':image_second', $saved['image_second'] ?? '');
    $uStmt->bindValue(':image_third', $saved['image_third'] ?? '');
    $uStmt->bindValue(':id', $id);
    $uStmt->execute();

    // Build public urls for saved images
    $base = "https://lodge.morelinks.com.ng/api/lodgefiles/";
    $data = [
        'id' => $id,
        'nin' => $nin,
        'title' => $title,
        'location' => $location,
        'price' => $price,
        'type' => $type,
        'description' => $description,
        'amenities' => $amenities,
        'capacity' => $capacity,
        'bathroomType' => $bathroomType,
        'image_first' => $saved['image_first'] ? $base . rawurlencode($saved['image_first']) : null,
        'image_second' => $saved['image_second'] ? $base . rawurlencode($saved['image_second']) : null,
        'image_third' => $saved['image_third'] ? $base . rawurlencode($saved['image_third']) : null,
    ];
    echo json_encode(["success" => true, "message" => "Lodge created", "data" => $data]);
    exit;

} catch (Exception $e) {
    error_log("add_lodge error: " . $e->getMessage() . "\n", 3, $respLog);
    echo json_encode(["success" => false, "message" => "Server error"]);
    exit;
}

?>
