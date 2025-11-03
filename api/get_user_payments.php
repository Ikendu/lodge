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

$email = trim($data['email'] ?? '');
$nin = trim($data['nin'] ?? '');

try {
    $db = new Database();
    $pdo = $db->connect();

    $sql = "SELECT * FROM payments WHERE 1=1";
    $params = [];
    if ($email) {
        $sql .= " AND (email = :email)";
        $params[':email'] = $email;
    }
    if ($nin) {
        $sql .= " AND (nin = :nin)";
        $params[':nin'] = $nin;
    }

    // If neither provided, return empty list
    if (empty($params)) {
        echo json_encode(['success' => true, 'payments' => []]);
        exit;
    }

    $sql .= " ORDER BY paid_at DESC, created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'payments' => $rows]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
