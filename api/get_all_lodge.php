<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/config.php';

$dbClass = new Database();
$pdo = $dbClass->connect();

$respLog = __DIR__ . '/lodge_upload_debug.log';

try {
    // Optional pagination: limit, offset. By default return all rows (limit=0 means all).
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $sql = 'SELECT id, userUid, userLoginMail, nin, title, location, price, type, description, amenities, capacity, bathroomType, image_first, image_second, image_third, created_at FROM lodges';
    $sql .= ' ORDER BY created_at DESC';
    $useLimit = $limit > 0;
    if ($useLimit) {
        $sql .= ' LIMIT :limit OFFSET :offset';
    }

    $stmt = $pdo->prepare($sql);
    if ($useLimit) {
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    }
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepend full URL for image fields if present
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
    error_log('get_all_lodge error: ' . $e->getMessage() . "\n", 3, $respLog);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}

?>
