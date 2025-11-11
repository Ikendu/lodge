<?php
declare(strict_types=1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Disable verbose errors (set to 0 in production)
error_reporting(0);

require_once __DIR__ . '/config.php';

// Simple JSON responder
function respond(bool $success, string $message, array $data = [], int $code = 200)
{
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Enforce POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid HTTP method. Use POST.', [], 405);
}

// Read NIN from POST
$nin = isset($_POST['nin']) ? trim((string)$_POST['nin']) : '';
if ($nin === '') {
    respond(false, 'Missing required parameter: nin or vnin', [], 400);
}

// Basic validation
if (!preg_match('/^[A-Za-z0-9]{6,20}$/', $nin)) {
    respond(false, 'Invalid NIN/vNIN format', [], 400);
}

$database = new Database();
$db = $database->connect();
if (!is_object($db) || !method_exists($db, 'prepare')) {
    error_log('[verify_nin] Invalid DB connection or PDO missing', 3, __DIR__ . '/verify_nin_error.log');
    respond(false, 'Database connection failed', [], 500);
}

try {
    $sql = "SELECT firstName, lastName FROM customers WHERE nin = :nin LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':nin', $nin);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        respond(false, 'NIN already registered', ['customer' => $row], 200);
    }

    // ✅ Dojah API setup
    $appId = "not available"; // your App ID
    // $secretKey = "test_sk_1BDJiWdVVPjUcpdK0YA5cHUZn"; // for testing
    $secretKey = "not available"; //for production

    // Detect vNIN
    $isVnin = strlen($nin) > 11 || preg_match('/[A-Za-z]/', $nin);

    // Correct sandbox endpoint
    // $dojahUrl = $isVnin
    //     ? "https://sandbox.dojah.io/api/v1/kyc/vnin?vnin=$nin"
    //     : "https://sandbox.dojah.io/api/v1/kyc/nin/advance?nin=$nin";

    = $isVnin
        ? "https://api.dojah.io/api/v1/kyc/vnin?vnin=$nin"
        : "https://api.dojah.io/api/v1/kyc/nin/advance?nin=$nin";

    // Initialize CURL for GET request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $dojahUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPGET => true,
        CURLOPT_HTTPHEADER => [
            "Accept: application/json",
            "Content-Type: application/json",
            "AppId: $appId",
            "Authorization: $secretKey"
        ],
        CURLOPT_TIMEOUT => 60,
    ]);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) {
        respond(false, "External verification request error: $err", [], 502);
    }

    $data = json_decode($response, true);

    if ($httpCode >= 400 || !is_array($data)) {
        respond(false, 'External verification failed', [
            'http_code' => $httpCode,
            'response' => $data ?: $response
        ], 502);
    }

    // ✅ Success
    $type = $isVnin ? 'vNIN' : 'NIN';
    respond(true, "$type verification successful", $data, 200);

} catch (PDOException $e) {
    error_log('[verify_nin] PDOException: ' . $e->getMessage() . "\n", 3, __DIR__ . '/verify_nin_error.log');
    respond(false, 'Database error while checking NIN', [], 500);
} catch (Throwable $t) {
    error_log('[verify_nin] Unexpected error: ' . $t->getMessage() . "\n", 3, __DIR__ . '/verify_nin_error.log');
    respond(false, 'Server error while processing request', [], 500);
}
