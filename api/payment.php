<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once __DIR__ . '/config.php';
$database = new Database();
$pdo = $database->connect();

 $url = "https://api.paystack.co/transaction/initialize";

  $fields = [
    'email' => "customer@email.com",
    'amount' => "500000"
  ];

  $fields_string = http_build_query($fields);

  //open connection
  $ch = curl_init();
  
  //set the url, number of POST vars, POST data
  curl_setopt($ch,CURLOPT_URL, $url);
  curl_setopt($ch,CURLOPT_POST, true);
  curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer SECRET_KEY",
    "Cache-Control: no-cache",
  ));
  
  //So that curl_exec returns the contents of the cURL; rather than echoing it
  curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 
  
  //execute post
  $result = curl_exec($ch);
  echo $result;

// Get JSON data from frontend
$input = json_decode(file_get_contents("php://input"), true);
$fullname = trim($input['fullname'] ?? '');
$email = trim($input['email'] ?? '');
$nin = trim($input['nin'] ?? '');
$payment_reference = trim($input['payment_reference'] ?? '');
$transaction_date = trim($input['transaction_date'] ?? '');

// Validate input
if (empty($fullname) || empty($email) || empty($nin) || empty($payment_reference) || empty($transaction_date)) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Insert payment details into the database
try {
    $sql = "INSERT INTO payments (fullname, email, nin, payment_reference, transaction_date) VALUES (:fullname, :email, :nin, :payment_reference, :transaction_date)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':fullname', $fullname);
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':nin', $nin);
    $stmt->bindValue(':payment_reference', $payment_reference);
    $stmt->bindValue(':transaction_date', $transaction_date);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Payment details saved successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
