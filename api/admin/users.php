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

// now $admin is available
try {
    $db = new Database();
    $pdo = $db->connect();

    $search = trim($_GET['search'] ?? '');
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $sql = 'SELECT * FROM customers';
    $params = [];
    if ($search !== '') {
        $sql .= ' WHERE (userLoginMail LIKE :q OR firstName LIKE :q OR lastName LIKE :q OR nin LIKE :q)';
        $params[':q'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $rows]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
