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
            $targetName = $nin . '_' . $suffix . '.' . $ext;
            $targetPath = $uploadDir . $targetName;
            if (move_uploaded_file($tmp, $targetPath)) {
                error_log("Saved lodge file to: $targetPath\n", 3, $respLog);
                $savedKey = 'image_' . $suffix;
                // store in saved array with DB column names image_first etc.
                $saved['image_' . $suffix] = $targetName;
            } else {
                $err = error_get_last();
                error_log("Failed to move_uploaded_file for $origName target $targetPath; err=" . json_encode($err) . "\n", 3, $respLog);
            }
        }
    }

    // Insert into DB (table: lodges). Ensure you have created this table with matching columns.
    $sql = "INSERT INTO lodges (
        userUid, userLoginMail, nin, title, location, price, type, description,
        amenities, capacity, bathroomType, image_first, image_second, image_third, created_at
    ) VALUES (
        :userUid, :userLoginMail, :nin, :title, :location, :price, :type, :description,
        :amenities, :capacity, :bathroomType, :image_first, :image_second, :image_third, NOW()
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
    $stmt->bindValue(':image_first', $saved['image_first'] ?? '');
    $stmt->bindValue(':image_second', $saved['image_second'] ?? '');
    $stmt->bindValue(':image_third', $saved['image_third'] ?? '');

    if ($stmt->execute()) {
        $id = $pdo->lastInsertId();
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
    } else {
        echo json_encode(["success" => false, "message" => "Failed to save lodge"]);
        exit;
    }

} catch (Exception $e) {
    error_log("add_lodge error: " . $e->getMessage() . "\n", 3, $respLog);
    echo json_encode(["success" => false, "message" => "Server error"]);
    exit;
}

?>
