<?php
// admin_auth.php - include at top of admin endpoints to require admin token
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/config.php';

$headers = getallheaders();
$authHeader = '';
if (isset($headers['Authorization'])) $authHeader = $headers['Authorization'];
elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) $authHeader = $_SERVER['HTTP_AUTHORIZATION'];

// allow token via ?token= or POST body param for convenience
$token = '';
if ($authHeader) {
    if (stripos($authHeader, 'Bearer ') === 0) {
        $token = trim(substr($authHeader, 7));
    } else {
        $token = trim($authHeader);
    }
}
if (!$token && isset($_GET['token'])) $token = trim($_GET['token']);
if (!$token && ($_SERVER['REQUEST_METHOD'] === 'POST')) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data) && isset($data['token'])) $token = trim($data['token']);
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Missing admin token']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare('SELECT s.*, a.username, a.email, a.role, a.is_active FROM admin_sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token = :token LIMIT 1');
    $stmt->execute([':token' => $token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit;
    }
    // check expiry if set
    if (!empty($row['expires_at']) && strtotime($row['expires_at']) < time()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token expired']);
        exit;
    }
    if (intval($row['is_active']) !== 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin account inactive']);
        exit;
    }

    // expose $admin variable to callers
    $admin = [
        'id' => $row['admin_id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'role' => $row['role']
    ];
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Auth error: ' . $e->getMessage()]);
    exit;
}

?>
