<?php
// register.php
// Accepts multipart/form-data from RegisterCustomer form
// Stores uploaded passport and inserts user data into MySQL using mysqli with prepared statements
// Returns JSON responses { success: bool, message: string }

// Basic configuration - use environment variables for sensitive data
$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '9652Aa@!@!@!';
$db_name = getenv('DB_NAME') ?: 'morelink_lodge';

// Where to store uploaded passports (ensure writable by the webserver)
$upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'passports' . DIRECTORY_SEPARATOR;
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

header('Content-Type: application/json; charset=utf-8');

function respond($success, $message = '', $extra = []) {
    http_response_code($success ? 200 : 400);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method');
}

// Basic CSRF protection: Expect a custom header or token. For now we allow same-origin via CORS and advise enabling CSRF tokens.
// You can implement a token check here if needed.

// Validate and sanitize inputs
$expected = ['firstName','middleName','lastName','email','nin','dob','address','permanentAddress','lga','state','country','phone'];
$input = [];
foreach ($expected as $key) {
    if (!isset($_POST[$key])) {
        respond(false, "Missing field: $key");
    }
    $val = trim($_POST[$key]);
    $input[$key] = $val;
}

// Basic validation rules
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Invalid email address');
}

// NIN: allow digits with length between 6 and 20 (adjust to local rules)
$nin = preg_replace('/\D/', '', $input['nin']);
if (strlen($nin) < 6 || strlen($nin) > 20) {
    respond(false, 'Invalid NIN');
}
$input['nin'] = $nin;

// DOB validation (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['dob'])) {
    respond(false, 'Invalid date of birth format');
}

// Handle passport upload
$passport_path = null;
if (isset($_FILES['passport']) && is_uploaded_file($_FILES['passport']['tmp_name'])) {
    $file = $_FILES['passport'];
    // Validate upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(false, 'File upload error');
    }

    // Validate MIME type and extension
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!array_key_exists($mime, $allowed)) {
        respond(false, 'Invalid passport file type (allowed: jpg, png, webp)');
    }

    // Limit size (e.g., 5MB)
    $maxBytes = 5 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        respond(false, 'Passport file too large (max 5MB)');
    }

    // Create a safe filename
    $ext = $allowed[$mime];
    $basename = bin2hex(random_bytes(12));
    $filename = $basename . '.' . $ext;
    $target = $upload_dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        respond(false, 'Failed to move uploaded file');
    }

    // store relative path for DB
    $passport_path = 'uploads/passports/' . $filename;
}

// Connect to DB using mysqli
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
    respond(false, 'Database connection failed');
}
$mysqli->set_charset('utf8mb4');

// Prepare insert statement - adjust table/columns to your schema
$sql = "INSERT INTO customers (first_name, middle_name, last_name, email, nin, dob, address, permanent_address, lga, state_of_origin, country, phone, passport_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
    respond(false, 'Failed to prepare statement');
}

$stmt->bind_param(
    'ssssssssssssss',
    $input['firstName'],
    $input['middleName'],
    $input['lastName'],
    $input['email'],
    $input['nin'],
    $input['dob'],
    $input['address'],
    $input['permanentAddress'],
    $input['lga'],
    $input['state'],
    $input['country'],
    $input['phone'],
    $passport_path
);

$exec = $stmt->execute();
if (!$exec) {
    // If DB insert fails, remove uploaded file to avoid orphan files
    if ($passport_path && file_exists(__DIR__ . DIRECTORY_SEPARATOR . $passport_path)) {
        @unlink(__DIR__ . DIRECTORY_SEPARATOR . $passport_path);
    }
    respond(false, 'Failed to save registration');
}

$stmt->close();
$mysqli->close();

// Success
respond(true, 'Registration saved');

?>
