<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../admin_auth.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data) || empty($data['id']) || empty($data['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'id and action required']);
    exit;
}

$id = (int)$data['id'];
$action = strtolower(trim($data['action']));

try {
    $db = new Database();
    $pdo = $db->connect();

    if (!in_array($action, ['process','reject'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM account_deletion_requests WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Request not found']);
        exit;
    }

    $newStatus = $action === 'process' ? 'processed' : 'rejected';
    $u = $pdo->prepare('UPDATE account_deletion_requests SET status = :status WHERE id = :id');
    $u->execute([':status' => $newStatus, ':id' => $id]);

    // optionally, if processed and user_uid exists, you might delete or deactivate the user here.

    echo json_encode(['success' => true, 'message' => 'Action applied', 'status' => $newStatus]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
