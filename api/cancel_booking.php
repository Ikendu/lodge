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

$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;

if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide booking_id']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $bookingId]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

?>
