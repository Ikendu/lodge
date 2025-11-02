<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$transaction_id = $data["transaction_id"];

$secret_key = "FLWSECK-531aba2516e9042546f704d28f1be770-19a3eb01ffavt-X";
$secret_test_key = "FLWSECK_TEST-a6bee8f332d655bfd2657e38b902ac6f-X";
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.flutterwave.com/v3/transactions/$transaction_id/verify",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => array(
    "Authorization: Bearer $secret_test_key",
    "Content-Type: application/json"
  ),
));

$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response, true);

if ($result && $result['status'] === 'success' && $result['data']['status'] === 'successful') {
    echo json_encode(["status" => "success", "data" => $result['data']]);
} else {
    echo json_encode(["status" => "failed", "data" => $result]);
}
?>
