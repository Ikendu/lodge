<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/config.php';

require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$dbClass = new Database();
$pdo = $dbClass->connect();

function clean($v) {
    return htmlspecialchars(strip_tags(trim($v)));
}

/**
 * Compress and save an uploaded image
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

    $origExt = strtolower(pathinfo($origName, PATHINFO_EXTENSION)) ?: 'jpg';
    $maxBytes = $maxKB * 1024;
    if (file_exists($tmpPath) && filesize($tmpPath) <= $maxBytes) {
        $targetExt = in_array($origExt, ['jpg','jpeg','png']) ? $origExt : 'jpg';
        $targetName = $nin . '_' . $id . '_' . $suffix . '_' . time() . '.' . $targetExt;
        $targetPath = $uploadDir . $targetName;
        if (@move_uploaded_file($tmpPath, $targetPath) || @copy($tmpPath, $targetPath)) {
            return $targetName;
        }
    }

    $src = null;
    if ($mime === 'image/jpeg' || $mime === 'image/pjpeg') {
        $src = @imagecreatefromjpeg($tmpPath);
        $targetExt = 'jpg';
    } elseif ($mime === 'image/png') {
        $png = @imagecreatefrompng($tmpPath);
        if ($png === false) return null;
        $canvas = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefilledrectangle($canvas, 0, 0, $width, $height, $white);
        imagecopy($canvas, $png, 0, 0, 0, 0, $width, $height);
        imagedestroy($png);
        $src = $canvas;
        $targetExt = 'jpg';
    } else {
        return null;
    }

    $maxDim = 2000;
    $scale = 1.0;
    if ($width > $maxDim || $height > $maxDim) {
        $scale = $maxDim / max($width, $height);
        $newW = intval($width * $scale);
        $newH = intval($height * $scale);
        $resized = imagescale($src, $newW, $newH, IMG_BILINEAR_FIXED);
        imagedestroy($src);
        $src = $resized;
    }

    $targetName = $nin . '_' . $id . '_' . $suffix . '_' . time() . '.' . $targetExt;
    $targetPath = $uploadDir . $targetName;

    $qualities = [90, 80, 70, 60, 50];
    foreach ($qualities as $q) {
        if (@imagejpeg($src, $targetPath, $q)) {
            clearstatcache(true, $targetPath);
            if (filesize($targetPath) <= $maxBytes) {
                imagedestroy($src);
                return $targetName;
            }
        }
    }
    @imagejpeg($src, $targetPath, 40);
    imagedestroy($src);
    return $targetName;
}

$respLog = __DIR__ . '/lodge_upload_debug.log';

try {
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
    $availability = isset($_POST['availability']) ? (int) $_POST['availability'] : 1;
    $userUid = clean($_POST['userUid'] ?? '');
    $userLoginMail = clean($_POST['userLoginMail'] ?? '');

    $uploadDir = __DIR__ . '/lodgefiles/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $sql = "INSERT INTO lodges (
        userUid, userLoginMail, nin, title, location, price, type, description,
        amenities, capacity, bathroomType, availability, image_first, image_second, image_third, created_at
    ) VALUES (
        :userUid, :userLoginMail, :nin, :title, :location, :price, :type, :description,
        :amenities, :capacity, :bathroomType, :availability, '', '', '', NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':userUid' => $userUid,
        ':userLoginMail' => $userLoginMail,
        ':nin' => $nin,
        ':title' => $title,
        ':location' => $location,
        ':price' => $price,
        ':type' => $type,
        ':description' => $description,
        ':amenities' => $amenities,
        ':capacity' => $capacity,
        ':bathroomType' => $bathroomType,
        ':availability' => $availability
    ]);

    $id = $pdo->lastInsertId();

    $map = ['image1' => 'first', 'image2' => 'second', 'image3' => 'third'];
    $saved = ['image_first' => null, 'image_second' => null, 'image_third' => null];
    foreach ($map as $key => $suffix) {
        if (!empty($_FILES[$key]) && $_FILES[$key]['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES[$key]['tmp_name'];
            $origName = $_FILES[$key]['name'];
            $compressed = save_compressed_image($tmp, $origName, $uploadDir, $nin, $id, $suffix, $respLog, 500);
            if ($compressed) $saved["image_$suffix"] = $compressed;
        }
    }

    $update = $pdo->prepare("UPDATE lodges SET image_first = :f, image_second = :s, image_third = :t WHERE id = :id");
    $update->execute([
        ':f' => $saved['image_first'] ?? '',
        ':s' => $saved['image_second'] ?? '',
        ':t' => $saved['image_third'] ?? '',
        ':id' => $id
    ]);

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

    // ✅ Notify admin via email
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'mail.morelinks.com.ng';
        $mail->SMTPAuth = true;
        $mail->Username = 'admin@morelinks.com.ng';
        $mail->Password = '9652Aa@!@!@!@';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;

        $mail->setFrom('admin@morelinks.com.ng', 'Morelinks Lodge');
        $mail->addAddress('xploremorelinks@gmail.com');

        $mail->isHTML(true);
        $mail->Subject = "New Lodge Added - {$title}";
        $mail->Body = "
            <h2 style='color:#004aad;'>A new lodge has been added</h2>
            <p><strong>Title:</strong> {$title}</p>
            <p><strong>Location:</strong> {$location}</p>
            <p><strong>Price:</strong> ₦" . number_format($price, 2) . "</p>
            <p><strong>Type:</strong> {$type}</p>
            <p><strong>Amenities:</strong> {$amenities}</p>
            <p><strong>Description:</strong> {$description}</p>
            <p><strong>Added by:</strong> {$userLoginMail}</p>
            <p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>
            <p><a href='https://lodge.morelinks.com.ng/lodge/{$id}' 
               style='background:#004aad;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;'>
               View in Dashboard</a></p>
        ";
        $mail->AltBody = "A new lodge has been added: {$title}, {$location}, ₦{$price}";

        $mail->send();
    } catch (Exception $e) {
        error_log("Admin email notification failed: " . $e->getMessage() . "\n", 3, $respLog);
    }

    echo json_encode(["success" => true, "message" => "Lodge created successfully", "data" => $data]);
    exit;

} catch (Exception $e) {
    error_log("add_lodge error: " . $e->getMessage() . "\n", 3, $respLog);
    echo json_encode(["success" => false, "message" => "Server error"]);
    exit;
}
?>
