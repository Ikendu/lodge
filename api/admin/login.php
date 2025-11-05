<?php
// Allow CORS for admin login (adjust origin in production)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Content-Type: application/json; charset=utf-8');
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
$password = $data['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'username and password required']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare('SELECT id, username, email, password_hash, is_active FROM admins WHERE username = :username OR email = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$admin) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }
    if (!password_verify($password, $admin['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }
    if (intval($admin['is_active']) !== 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin account disabled']);
        exit;
    }

    // create session token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + 60*60*24);
    $insert = $pdo->prepare('INSERT INTO admin_sessions (admin_id, token, ip_address, user_agent, expires_at) VALUES (:admin_id, :token, :ip, :ua, :exp)');
    $insert->execute([
        ':admin_id' => $admin['id'],
        ':token' => $token,
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ':ua' => $_SERVER['HTTP_USER_AGENT'] ?? null,
        ':exp' => $expires
    ]);

    // update last_login
    $u = $pdo->prepare('UPDATE admins SET last_login = NOW() WHERE id = :id');
    $u->execute([':id' => $admin['id']]);

    echo json_encode(['success' => true, 'token' => $token, 'expires_at' => $expires]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
