<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Database connection
$servername = "localhost";
$username = "root"; // Change if needed
$password = ""; // Change if needed
$dbname = "lodge"; // your database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check DB connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// Get JSON data from frontend
$input = json_decode(file_get_contents("php://input"), true);
$uid = trim($input["uid"] ?? "");
$email = trim($input["email"] ?? "");

// Validate input
if (empty($uid) && empty($email)) {
    echo json_encode(["success" => false, "error" => "Missing UID or Email"]);
    exit;
}

// Query the database
$sql = "SELECT * FROM customers WHERE userUid = ? OR userLoginMail = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $uid, $email);
$stmt->execute();
$result = $stmt->get_result();

// Return result
if ($result && $result->num_rows > 0) {
    $profile = $result->fetch_assoc();

    // If images are stored as filenames, also provide full public URLs
    $base = "https://lodge.morelinks.com.ng/userImage/";
    if (!empty($profile['image'])) {
        $img = trim($profile['image']);
        if (!preg_match('/^(https?:\\/\\/|data:|\\/)/i', $img)) {
            $profile['image_url'] = $base . rawurlencode($img);
        } else {
            $profile['image_url'] = $img;
        }
    }
    if (!empty($profile['verified_image'])) {
        $vimg = trim($profile['verified_image']);
        if (!preg_match('/^(https?:\\/\\/|data:|\\/)/i', $vimg)) {
            $profile['verified_image_url'] = $base . rawurlencode($vimg);
        } else {
            $profile['verified_image_url'] = $vimg;
        }
    }

    echo json_encode(["success" => true, "profile" => $profile]);
} else {
    echo json_encode(["success" => false, "error" => "No profile found"]);
}

$stmt->close();
$conn->close();
?>
