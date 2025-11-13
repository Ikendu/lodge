<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Read JSON or form body
$input = null;
$raw = file_get_contents('php://input');
if ($raw) {
    $data = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE) $input = $data;
}
if (!$input) $input = $_POST;

// Sanitize inputs
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$message = trim($input['message'] ?? '');

if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    // Ensure contacts table exists
    $conn->exec("CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Prevent duplicate identical messages
    $dupStmt = $conn->prepare("SELECT message FROM contacts WHERE email = :email ORDER BY created_at DESC LIMIT 1");
    $dupStmt->execute([':email' => $email]);
    $last = $dupStmt->fetch();
    if ($last && trim($last['message']) === trim($message)) {
        echo json_encode(['success' => false, 'message' => 'Message already sent']);
        exit;
    }

    // Save to DB
    $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, message) VALUES (:name, :email, :phone, :message)");
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':message' => $message
    ]);

    // ---- EMAIL SETUP ----
    $fromEmail = 'admin@morelinks.com.ng';
    $fromName = 'Morelinks Lodge Team';
    $adminEmail = 'admin@morelinks.com.ng';

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'mail.morelinks.com.ng';
    $mail->SMTPAuth = true;
    $mail->Username = 'admin@morelinks.com.ng';
    $mail->Password = '9652Aa@!@!@!@';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->isHTML(true);

    // 1️⃣ Send to USER
    $mail->setFrom($fromEmail, $fromName);
    $mail->addAddress($email, $name);
    $mail->Subject = 'Thanks for contacting Morelinks Lodge';
    $mail->Body = "
        <div style='font-family: Arial, sans-serif;'>
            <p>Dear <strong>{$name}</strong>,</p>
            <p>Thank you for reaching out to <b>Morelinks Lodge</b>. We have received your message and our team will get back to you shortly.</p>
            <hr>
            <p><b>Your Message:</b></p>
            <blockquote style='color: #555; font-style: italic;'>{$message}</blockquote>
            <p>Warm regards,<br>Morelinks Lodge Support Team</p>
        </div>";
    $mail->AltBody = "Dear $name,\n\nThank you for contacting Morelinks Lodge. We’ve received your message and will get back to you shortly.\n\nMessage:\n$message\n\n-- Morelinks Lodge Support Team";
    $mail->send();

    // 2️⃣ Send to ADMIN
    $adminMail = new PHPMailer(true);
    $adminMail->isSMTP();
    $adminMail->Host = 'mail.morelinks.com.ng';
    $adminMail->SMTPAuth = true;
    $adminMail->Username = 'admin@morelinks.com.ng';
    $adminMail->Password = '9652Aa@!@!@!@';
    $adminMail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $adminMail->Port = 465;
    $adminMail->isHTML(true);

    $adminMail->setFrom($fromEmail, $fromName);
    // $adminMail->addAddress('$adminEmail', 'Morelinks Admin');
    $adminMail->addAddress('xploremorelinks@gmail.com', 'Morelinks Admin');
    $adminMail->Subject = "New Contact Message from {$name}";
    $adminMail->Body = "
        <div style='font-family: Arial, sans-serif;'>
            <h3>New Contact Message</h3>
            <p><b>Name:</b> {$name}</p>
            <p><b>Email:</b> {$email}</p>
            <p><b>Phone:</b> {$phone}</p>
            <p><b>Message:</b><br>{$message}</p>
            <hr>
            <p>Sent from Morelinks Lodge contact form.</p>
        </div>";
    $adminMail->AltBody = "New message from $name <$email>\nPhone: $phone\n\n$message";
    $adminMail->send();

    echo json_encode(['success' => true, 'message' => 'Message received and emails sent.']);
} catch (Exception $e) {
    file_put_contents(__DIR__ . '/contact_error.log', '[' . date('c') . '] Mailer Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Error sending email: ' . $e->getMessage()]);
} catch (Throwable $e) {
    file_put_contents(__DIR__ . '/contact_error.log', '[' . date('c') . '] ' . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
