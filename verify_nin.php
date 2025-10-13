<?php
// verify_nin.php
// Server-side proxy to verify NIN via Dojo API (or mock if no API key provided)
header('Content-Type: application/json; charset=utf-8');

function respond($success, $message = '', $extra = []) {
    http_response_code($success ? 200 : 400);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method');
}

$nin = isset($_POST['nin']) ? preg_replace('/\D/', '', trim($_POST['nin'])) : '';
if (!$nin) respond(false, 'Missing NIN');

// DOJO API key from environment
$dojo_key = getenv('DOJO_API_KEY') ?: '';

// If no DOJO API key is configured, return mock data (useful for local/dev)
if (!$dojo_key) {
    // Mocked response (simulate successful lookup)
    $mock = [
        'firstName' => 'John',
        'middleName' => 'A',
        'lastName' => 'Doe',
        'dob' => '1988-01-01',
        'nin' => $nin,
    ];
    respond(true, 'Mock lookup success', ['data' => $mock]);
}

// Call the Dojo API (example endpoint - adapt to your provider docs)
$url = "https://api.dojo.example/verify/nin/" . urlencode($nin);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $dojo_key", 'Accept: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$resp = curl_exec($ch);
$err = curl_error($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($err) respond(false, 'Verification request failed');

$json = json_decode($resp, true);
if (!$json || $status !== 200) {
    respond(false, 'NIN verification failed');
}

// Map provider response to fields used by the frontend
$data = [
    'firstName' => $json['first_name'] ?? ($json['firstName'] ?? ''),
    'middleName' => $json['middle_name'] ?? ($json['middleName'] ?? ''),
    'lastName' => $json['last_name'] ?? ($json['lastName'] ?? ''),
    'dob' => $json['dob'] ?? '',
    'nin' => $nin,
];

respond(true, 'Verification successful', ['data' => $data]);

?>
