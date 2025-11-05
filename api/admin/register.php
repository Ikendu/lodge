<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$display = trim($data['display_name'] ?? '');

if (!$username || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'username, email and password required']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    // Only allow registering the first admin if no admins exist
    $cnt = $pdo->query('SELECT COUNT(*) as c FROM admins')->fetch(PDO::FETCH_ASSOC);
    if ($cnt && intval($cnt['c']) > 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin already exists. Registration disabled.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO admins (username, email, password_hash, display_name, role, is_active) VALUES (:username, :email, :hash, :display, :role, 1)');
    $stmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':hash' => $hash,
        ':display' => $display,
        ':role' => 'superadmin'
    ]);
    $adminId = $pdo->lastInsertId();

    // create session token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + 60*60*24);
    $insert = $pdo->prepare('INSERT INTO admin_sessions (admin_id, token, ip_address, user_agent, expires_at) VALUES (:admin_id, :token, :ip, :ua, :exp)');
    $insert->execute([
        ':admin_id' => $adminId,
        ':token' => $token,
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ':ua' => $_SERVER['HTTP_USER_AGENT'] ?? null,
        ':exp' => $expires
    ]);

    echo json_encode(['success' => true, 'token' => $token, 'expires_at' => $expires]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
