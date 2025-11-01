<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
require_once 'config.php';


// Load environment variables


// Read raw POST body (in case frontend sends FormData or JSON)
$input = file_get_contents("php://input");

// Try decoding input if it’s JSON (optional)
$data = json_decode($input, true);

$email = $data['email'];
$amount = $data['amount']; // amount in kobo (₦5000)

// Initialize Paystack transaction
$url = "https://api.paystack.co/transaction/initialize";
$fields = [
  'email' => $email,
  'amount' => $amount
];

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer $paystackSecret",
  "Cache-Control: no-cache",
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute and capture result
$result = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
  echo json_encode([
    'status' => false,
    'message' => 'Curl error: ' . curl_error($ch)
  ]);
  curl_close($ch);
  exit;
}

curl_close($ch);

// Output Paystack response as-is
echo $result;
?>
