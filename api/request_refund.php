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

// NEW PAYLOAD FIELDS
$payment_id = intval($data['payment_id'] ?? 0);
$reference = trim($data['reference'] ?? '');

$userEmail = trim($data['userEmail'] ?? '');
$userMobile = trim($data['userMobile'] ?? '');
$userName = trim($data['userName'] ?? '');
$amount = floatval($data['amount'] ?? 0);

$lodgeTitle = trim($data['lodgeTitle'] ?? '');
$lodgeOwnerNumber = trim($data['lodgeOwnerNumber'] ?? '');
$lodgeOwnerEmail = trim($data['lodgeOwnerEmail'] ?? '');

$reason = trim($data['reason'] ?? '');

if (!$payment_id && !$reference) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide payment_id or reference']);
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

    // ensure refund_requests table has all new fields
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS refund_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            payment_id INT NOT NULL,
            payment_reference VARCHAR(200) NOT NULL,
            user_email VARCHAR(255) DEFAULT NULL,
            user_mobile VARCHAR(50) DEFAULT NULL,
            user_name VARCHAR(255) DEFAULT NULL,
            amount DECIMAL(12,2) DEFAULT 0,
            lodge_title VARCHAR(255) DEFAULT NULL,
            lodge_owner_mobile VARCHAR(50) DEFAULT NULL,
            lodge_owner_email VARCHAR(255) DEFAULT NULL,
            reason TEXT DEFAULT NULL,
            status VARCHAR(50) DEFAULT 'requested',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // check if already requested
    $check = $pdo->prepare('SELECT id FROM refund_requests WHERE payment_id = :pid LIMIT 1');
    $check->execute([':pid' => $payment['id']]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Refund already requested for this payment']);
        exit;
    }

    // Insert new full payload
    $insert = $pdo->prepare("
        INSERT INTO refund_requests 
        (payment_id, payment_reference, user_email, user_mobile, user_name, amount, lodge_title, 
         lodge_owner_mobile, lodge_owner_email, reason, status)
        VALUES 
        (:pid, :pref, :email, :mobile, :uname, :amount, :ltitle, :lownum, :lowemail, :reason, 'requested')
    ");

    $insert->execute([
        ':pid' => $payment['id'],
        ':pref' => $reference ?: $payment['reference'] ?? '',
        ':email' => $userEmail ?: $payment['email'] ?? null,
        ':mobile' => $userMobile,
        ':uname' => $userName,
        ':amount' => $amount,
        ':ltitle' => $lodgeTitle,
        ':lownum' => $lodgeOwnerNumber,
        ':lowemail' => $lodgeOwnerEmail,
        ':reason' => $reason,
    ]);

    // mark payment as refund_requested
    try {
        $pdo->exec("ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_requested TINYINT(1) DEFAULT 0;");
    } catch (Exception $e) {}

    try {
        $u = $pdo->prepare('UPDATE payments SET refund_requested = 1 WHERE id = :id');
        $u->execute([':id' => $payment['id']]);
    } catch (Exception $e) {}

    echo json_encode(['success' => true, 'message' => 'Refund request submitted successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
