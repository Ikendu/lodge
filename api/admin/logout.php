<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../admin_auth.php';

// admin_auth exposes $admin and validated token in headers or GET/POST
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = '';
if ($authHeader) {
    if (stripos($authHeader, 'Bearer ') === 0) $token = trim(substr($authHeader, 7));
    else $token = trim($authHeader);
}
if (!$token && isset($_GET['token'])) $token = trim($_GET['token']);

if (!$token) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing token']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $del = $pdo->prepare('DELETE FROM admin_sessions WHERE token = :token');
    $del->execute([':token' => $token]);
    echo json_encode(['success' => true, 'message' => 'Logged out']);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
