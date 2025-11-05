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

    // only allow approved actions
    if (!in_array($action, ['approve','deny'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
    }

    // check request exists
    $stmt = $pdo->prepare('SELECT * FROM refund_requests WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Refund request not found']);
        exit;
    }

    $newStatus = $action === 'approve' ? 'approved' : 'denied';
    $u = $pdo->prepare('UPDATE refund_requests SET status = :status WHERE id = :id');
    $u->execute([':status' => $newStatus, ':id' => $id]);

    // optional: mark payment as refunded_on_server when approved
    if ($action === 'approve' && !empty($row['payment_id'])) {
        try {
            $upd = $pdo->prepare('UPDATE payments SET refunded = 1 WHERE id = :pid');
            $upd->execute([':pid' => (int)$row['payment_id']]);
        } catch (Exception $e) { /* ignore if column missing */ }
    }

    echo json_encode(['success' => true, 'message' => 'Action applied', 'status' => $newStatus]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
