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
action:
$action = strtolower(trim($data['action']));

try {
    $db = new Database();
    $pdo = $db->connect();

    if ($action !== 'delete') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
    }

    // Consider foreign keys / related data; here we perform a simple delete
    $del = $pdo->prepare('DELETE FROM customers WHERE id = :id');
    $del->execute([':id' => $id]);
    if ($del->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'User deleted']);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>