<?php
header('Content-Type: application/json; charset=utf-8');
// Allow CORS from the frontend (adjust origin as needed)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

// read JSON body or form-encoded
$input = null;
$raw = file_get_contents('php://input');
if ($raw) {
    $data = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE) $input = $data;
}

if (!$input) {
    // fallback to $_POST
    $input = $_POST;
}

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$message = isset($input['message']) ? trim($input['message']) : '';

if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// basic email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    // create table if not exists (safe to run)
    $conn->exec("CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Check for duplicate: fetch the most recent message from this email
    $dupStmt = $conn->prepare("SELECT message FROM contacts WHERE email = :email ORDER BY created_at DESC LIMIT 1");
    $dupStmt->execute([':email' => $email]);
    $last = $dupStmt->fetch();
    if ($last && isset($last['message'])) {
        // compare trimmed messages exactly
        if (trim($last['message']) === trim($message)) {
            echo json_encode(['success' => false, 'message' => 'message already sent']);
            exit;
        }
    }

    $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, message) VALUES (:name, :email, :phone, :message)");
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':message' => $message
    ]);

    echo json_encode(['success' => true, 'message' => 'Message received.']);
    exit;
} catch (Throwable $e) {
    // log error
    $msg = '[' . date('c') . '] ' . $e->getMessage() . "\n";
    file_put_contents(__DIR__ . '/contact_error.log', $msg, FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}

?>
