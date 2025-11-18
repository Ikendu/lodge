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
$userUid = isset($data['user_uid']) ? trim($data['user_uid']) : null;
$paymentId = isset($data['payment_id']) ? (int)$data['payment_id'] : null;
$start = !empty($data['startDate']) ? date('Y-m-d', strtotime($data['startDate'])) : null;
$end = !empty($data['endDate']) ? date('Y-m-d', strtotime($data['endDate'])) : null;
$nights = isset($data['nights']) ? (int)$data['nights'] : 0;

if (!$lodgeId || !$start || !$end) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide lodge_id, startDate and endDate']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    // Verify no overlapping confirmed bookings
    $sql = "SELECT id FROM bookings WHERE lodge_id = :lid AND status = 'booked' AND NOT (end_date < :start OR start_date > :end) LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':lid' => $lodgeId, ':start' => $start, ':end' => $end]);
    $conflict = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($conflict) {
        echo json_encode(['success' => false, 'message' => 'Lodge already booked for selected dates', 'conflict_id' => $conflict['id']]);
        exit;
    }

    $ins = "INSERT INTO bookings (lodge_id, user_uid, payment_id, start_date, end_date, nights, status, created_at) VALUES (:lid, :uid, :pid, :start, :end, :nights, 'booked', NOW())";
    $s = $pdo->prepare($ins);
    $s->execute([
        ':lid' => $lodgeId,
        ':uid' => $userUid,
        ':pid' => $paymentId,
        ':start' => $start,
        ':end' => $end,
        ':nights' => $nights,
    ]);
    $bookingId = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'booking_id' => $bookingId]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

?>
