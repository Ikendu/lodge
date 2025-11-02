<?php
header('Content-Type: application/json; charset=utf-8');

// Allow CORS during development (adjust for production)
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

// Required fields you want to ensure exist (adjust as needed)
$required = ['fullname', 'amount', 'reference', 'paid_at', 'channel', 'nin', 'email', 'lodge_title', 'lodge_location'];

foreach ($required as $r) {
    if (!isset($data[$r]) || $data[$r] === '') {
        // Allow some fields to be empty? adjust as desired
        // For now, just warn but continue - change to return 400 to require all.
        // http_response_code(400);
        // echo json_encode(['success' => false, 'message' => \"Missing field: $r\"]);
        // exit;
    }
}

// Normalise / sanitize input
$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$nin = trim($data['nin'] ?? '');
$gender = trim($data['gender'] ?? '');
$amount = is_numeric($data['amount']) ? (float)$data['amount'] : null;
$reference = trim($data['reference'] ?? '');
$paid_at_raw = $data['paid_at'] ?? null;
$channel = trim($data['channel'] ?? '');
$lodge_title = trim($data['lodge_title'] ?? '');
$lodge_location = trim($data['lodge_location'] ?? '');
$order_id = isset($data['order_id']) ? trim($data['order_id']) : null;

// Convert paid_at to MySQL DATETIME (attempt)
$paid_at = null;
if ($paid_at_raw) {
    try {
        $dt = new DateTime($paid_at_raw);
        $paid_at = $dt->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        // if parse fails, fallback to current time
        $paid_at = date('Y-m-d H:i:s');
    }
} else {
    $paid_at = date('Y-m-d H:i:s');
}

try {
    $db = new Database();
    $pdo = $db->connect(); // returns PDO object

    // Insert prepared statement (PDO)
    $sql = \"INSERT INTO payments
        (fullname, email, nin, gender, channel, amount, reference, paid_at, lodge_title, lodge_location, order_id, created_at)
        VALUES
        (:fullname, :email, :nin, :gender, :channel, :amount, :reference, :paid_at, :lodge_title, :lodge_location, :order_id, NOW())
    \";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':fullname', $fullname ?: null);
    $stmt->bindValue(':email', $email ?: null);
    $stmt->bindValue(':nin', $nin ?: null);
    $stmt->bindValue(':gender', $gender ?: null);
    $stmt->bindValue(':channel', $channel ?: null);
    $stmt->bindValue(':amount', $amount ?: 0);
    $stmt->bindValue(':reference', $reference ?: null);
    $stmt->bindValue(':paid_at', $paid_at);
    $stmt->bindValue(':lodge_title', $lodge_title ?: null);
    $stmt->bindValue(':lodge_location', $lodge_location ?: null);
    $stmt->bindValue(':order_id', $order_id ?: null);

    $ok = $stmt->execute();

    if ($ok) {
        $insertId = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'insert_id' => $insertId]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Insert failed']);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    // In production, do not echo raw exceptions; log them instead.
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}