<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$reason = trim($data['reason'] ?? '');
$user_uid = trim($data['user_uid'] ?? $data['userUid'] ?? '');

if (!$fullname || !$email || !$phone) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'fullname, email and phone are required']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare('INSERT INTO account_deletion_requests (fullname, email, phone, mobile, reason, user_uid, created_at) VALUES (:fullname, :email, :phone, :mobile, :reason, :user_uid, NOW())');
    $stmt->execute([
        ':fullname' => $fullname,
        ':email' => $email,
        ':phone' => $phone,
        ':mobile' => $mobile,
        ':reason' => $reason,
        ':user_uid' => $user_uid,
    ]);

    echo json_encode(['success' => true, 'message' => 'Request saved']);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}
