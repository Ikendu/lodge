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

$reference = trim($data['reference'] ?? '');
$payment_id = intval($data['payment_id'] ?? 0);
$email = trim($data['email'] ?? '');
$reason = trim($data['reason'] ?? '');

if (!$reference && !$payment_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide payment reference or payment_id']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    // find payment
    $sql = 'SELECT * FROM payments WHERE ';
    if ($payment_id) {
        $sql .= 'id = :id LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $payment_id]);
    } else {
        $sql .= 'reference = :ref LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':ref' => $reference]);
    }

    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$payment) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Payment not found']);
        exit;
    }

    // basic ownership check: if email supplied, require it matches payment email
    if ($email && strtolower($email) !== strtolower($payment['email'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Payment does not belong to this user']);
        exit;
    }

    // ensure refund_requests table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS refund_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id INT NOT NULL,
        payment_reference VARCHAR(200) NOT NULL,
        user_email VARCHAR(255) DEFAULT NULL,
        reason TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'requested',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // check if already requested
    $check = $pdo->prepare('SELECT id FROM refund_requests WHERE payment_id = :pid LIMIT 1');
    $check->execute([':pid' => $payment['id']]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Refund already requested for this payment']);
        exit;
    }

    $insert = $pdo->prepare('INSERT INTO refund_requests (payment_id, payment_reference, user_email, reason, status) VALUES (:pid, :pref, :email, :reason, :status)');
    $insert->execute([
        ':pid' => $payment['id'],
        ':pref' => $payment['reference'] ?? $payment['payment_reference'] ?? '',
        ':email' => $email ?: $payment['email'] ?? null,
        ':reason' => $reason,
        ':status' => 'requested',
    ]);

    // attempt best-effort update on payments table to mark refund requested if column exists
    try {
        $pdo->exec("ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_requested TINYINT(1) DEFAULT 0;");
    } catch (Exception $e) {
        // some MySQL versions don't support IF NOT EXISTS — ignore errors here
    }
    try {
        $u = $pdo->prepare('UPDATE payments SET refund_requested = 1 WHERE id = :id');
        $u->execute([':id' => $payment['id']]);
    } catch (Exception $e) {
        // ignore if column missing
    }

    echo json_encode(['success' => true, 'message' => 'Refund request submitted']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
