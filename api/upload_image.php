<?php
// upload_image.php
// Accepts a multipart file upload (field 'file') and optional 'name' to save under userImage/
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$userImageDir = __DIR__ . DIRECTORY_SEPARATOR . 'userImage' . DIRECTORY_SEPARATOR;
if (!file_exists($userImageDir)) {
    @mkdir($userImageDir, 0775, true);
}

$response = ['success' => false, 'message' => 'No file uploaded'];

if (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['file'];
    // optional forced name
    $name = isset($_POST['name']) ? preg_replace('/[^a-zA-Z0-9_\.\-]/', '_', $_POST['name']) : '';
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) ?: 'jpg';
    $allowed = ['jpg','jpeg','png'];
    if (!in_array($ext, $allowed)) {
        $response = ['success' => false, 'message' => 'Invalid file type'];
        echo json_encode($response);
        exit;
    }
    if ($name) {
        // ensure extension
        if (!preg_match('/\.' . preg_quote($ext, '/') . '$/i', $name)) {
            $name = $name . '.' . $ext;
        }
        $targetName = $name;
    } else {
        $targetName = uniqid('img_', true) . '.' . $ext;
    }

    $targetPath = $userImageDir . $targetName;
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $urlBase = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'lodge.morelinks.com.ng') . '/userImage/';
        $response = ['success' => true, 'filename' => $targetName, 'url' => $urlBase . rawurlencode($targetName)];
    } else {
        $response = ['success' => false, 'message' => 'Failed to move uploaded file'];
    }
} else {
    // support raw base64 in POST 'data'
    $data = $_POST['data'] ?? null;
    $name = $_POST['name'] ?? null;
    if ($data && preg_match('/^data:(image\/\w+);base64,/', $data, $m)) {
        $mime = $m[1];
        $ext = str_replace('image/', '', $mime);
        if ($ext === 'jpeg') $ext = 'jpg';
        $bin = base64_decode(preg_replace('/^data:.*?;base64,/', '', $data));
        $targetName = ($name ? preg_replace('/[^a-zA-Z0-9_\.\-]/', '_', $name) : uniqid('img_', true)) . '.' . $ext;
        $written = file_put_contents($userImageDir . $targetName, $bin);
        if ($written !== false) {
            $urlBase = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'lodge.morelinks.com.ng') . '/userImage/';
            $response = ['success' => true, 'filename' => $targetName, 'url' => $urlBase . rawurlencode($targetName)];
        } else {
            $response = ['success' => false, 'message' => 'Failed to write decoded image'];
        }
    }
}

echo json_encode($response);
exit;
