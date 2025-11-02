<?php
header('Content-Type: application/json; charset=utf-8');

// Allow CORS (adjust domain in production)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

// Read JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$nin = trim($data['nin'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$gender = trim($data['gender'] ?? '');
$amount = is_numeric($data['amount']) ? (float)$data['amount'] : 0;
$reference = trim($data['reference'] ?? '');
$channel = trim($data['channel'] ?? '');
$lodge_title = trim($data['lodge_title'] ?? '');
$lodge_location = trim($data['lodge_location'] ?? '');
$order_id = trim($data['order_id'] ?? '');
$paid_at_raw = $data['paid_at'] ?? null;

$paid_at = $paid_at_raw ? date('Y-m-d H:i:s', strtotime($paid_at_raw)) : date('Y-m-d H:i:s');

try {
    $db = new Database();
    $pdo = $db->connect();

    // Check if this reference already exists
    $check = $pdo->prepare("SELECT id FROM payments WHERE reference = :ref LIMIT 1");
    $check->execute([':ref' => $reference]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Duplicate reference — payment already saved.']);
        exit;
    }

    $sql = "INSERT INTO payments
        (fullname, email, nin, mobile, gender, channel, amount, reference, paid_at, lodge_title, lodge_location, order_id, created_at)
        VALUES
        (:fullname, :email, :nin, :mobile, :gender, :channel, :amount, :reference, :paid_at, :lodge_title, :lodge_location, :order_id, NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':fullname' => $fullname,
        ':email' => $email,
        ':nin' => $nin,
        ':mobile' => $mobile,
        ':gender' => $gender,
        ':channel' => $channel,
        ':amount' => $amount,
        ':reference' => $reference,
        ':paid_at' => $paid_at,
        ':lodge_title' => $lodge_title,
        ':lodge_location' => $lodge_location,
        ':order_id' => $order_id,
    ]);

    echo json_encode(['success' => true, 'insert_id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
        echo json_encode(['success' => false, 'message' => 'Duplicate payment reference detected.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
