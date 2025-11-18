<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$lodgeId = isset($data['lodge_id']) ? (int)$data['lodge_id'] : 0;
$start = !empty($data['startDate']) ? date('Y-m-d', strtotime($data['startDate'])) : null;
$end = !empty($data['endDate']) ? date('Y-m-d', strtotime($data['endDate'])) : null;

if (!$lodgeId || !$start || !$end) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide lodge_id, startDate and endDate']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    // Check for overlapping bookings with status 'booked'
    $sql = "SELECT id, start_date, end_date, status FROM bookings WHERE lodge_id = :lid AND status = 'booked' AND NOT (end_date < :start OR start_date > :end) ORDER BY start_date";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':lid' => $lodgeId, ':start' => $start, ':end' => $end]);
    $conflicts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $available = count($conflicts) === 0;
    echo json_encode(['success' => true, 'available' => $available, 'conflicts' => $conflicts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

?>
