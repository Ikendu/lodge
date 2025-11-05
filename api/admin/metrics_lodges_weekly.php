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

    $weeks = isset($_GET['weeks']) ? max(1, (int)$_GET['weeks']) : 8;
    $labels = [];
    $counts = [];

    // build week buckets starting from oldest to newest
    for ($i = $weeks - 1; $i >= 0; $i--) {
        // get monday of the week
        $monday = strtotime("Monday this week -$i week");
        // if today is Monday and $i==0, strtotime returns today; fine
        $start = date('Y-m-d 00:00:00', $monday);
        $end = date('Y-m-d 00:00:00', strtotime('+7 days', $monday));
        $labels[] = date('M j', $monday);

        $stmt = $pdo->prepare('SELECT COUNT(*) as c FROM lodges WHERE created_at >= :start AND created_at < :end');
        $stmt->execute([':start' => $start, ':end' => $end]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $counts[] = intval($row['c'] ?? 0);
    }

    echo json_encode(['success' => true, 'data' => ['labels' => $labels, 'counts' => $counts]]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}

?>
