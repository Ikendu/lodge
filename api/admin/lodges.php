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

try {
    $db = new Database();
    $pdo = $db->connect();

    $search = trim($_GET['search'] ?? '');
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $sql = 'SELECT id, userUid, userLoginMail, nin, title, location, price, type, created_at FROM lodges';
    $params = [];
    if ($search !== '') {
        $sql .= ' WHERE (title LIKE :q OR location LIKE :q OR userLoginMail LIKE :q)';
        $params[':q'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add image URLs if present
    $base = 'https://lodge.morelinks.com.ng/api/lodgefiles/';
    foreach ($rows as &$r) {
        foreach (['image_first','image_second','image_third'] as $col) {
            if (!empty($r[$col])) {
                $r[$col . '_url'] = $base . rawurlencode($r[$col]);
            } else {
                $r[$col . '_url'] = null;
            }
        }
    }

    echo json_encode(['success' => true, 'data' => $rows]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
