<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../admin_auth.php';

try {
    $db = new Database();
    $pdo = $db->connect();

    $metrics = [];

    $metrics['users'] = (int)$pdo->query('SELECT COUNT(*) as c FROM customers')->fetch(PDO::FETCH_ASSOC)['c'];
    $metrics['lodges'] = (int)$pdo->query('SELECT COUNT(*) as c FROM lodges')->fetch(PDO::FETCH_ASSOC)['c'];
    $metrics['payments'] = (int)$pdo->query('SELECT COUNT(*) as c FROM payments')->fetch(PDO::FETCH_ASSOC)['c'];
    // pending refunds
    $res = $pdo->query("SELECT COUNT(*) as c FROM refund_requests WHERE status = 'requested'");
    $metrics['pending_refunds'] = (int)$res->fetch(PDO::FETCH_ASSOC)['c'];
    $metrics['account_deletions'] = (int)$pdo->query('SELECT COUNT(*) as c FROM account_deletion_requests')->fetch(PDO::FETCH_ASSOC)['c'];
    // complaints table may not exist yet
    try {
        $metrics['complaints'] = (int)$pdo->query('SELECT COUNT(*) as c FROM complaints')->fetch(PDO::FETCH_ASSOC)['c'];
    } catch (Exception $e) {
        $metrics['complaints'] = 0;
    }

    echo json_encode(['success' => true, 'data' => $metrics]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
