<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// Get reference from query parameter
if (!isset($_GET['reference'])) {
  echo json_encode(["status" => false, "message" => "No reference provided"]);
  exit;
}


$reference = $_GET['reference'];
$url = "https://api.paystack.co/transaction/verify/" . $reference;

$ch = curl_init();
curl_setopt_array($ch, array(
  CURLOPT_URL => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTPHEADER => array(
    "Authorization: Bearer $paystackSecret",
    "Cache-Control: no-cache",
  ),
));

$response = curl_exec($ch);
$err = curl_error($ch);

curl_close($ch);

if ($err) {
  echo json_encode(["status" => false, "message" => "cURL Error: " . $err]);
} else {
  echo $response; // Return Paystack's verification JSON
}
?>
