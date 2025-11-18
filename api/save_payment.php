<?php
header('Content-Type: application/json; charset=utf-8');

// Allow CORS (adjust for production)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

// Read JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

// Extract data safely
$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$nin = trim($data['nin'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$gender = trim($data['gender'] ?? '');
$amount = is_numeric($data['amount']) ? (float)$data['amount'] : 0;
$reference = trim($data['reference'] ?? '');
$channel = trim($data['channel'] ?? '');
$lodge_title = trim($data['lodge_title'] ?? '');
$lodge_location = trim($data['lodge_location'] ?? '');
$order_id = trim($data['order_id'] ?? '');
$paid_at_raw = $data['paid_at'] ?? null;
$paid_at = $paid_at_raw ? date('Y-m-d H:i:s', strtotime($paid_at_raw)) : date('Y-m-d H:i:s');

// Lodge details
$amenities = trim($data['amenities'] ?? '');
$bathroomType = trim($data['bathroomType'] ?? '');
$capacity = trim($data['capacity'] ?? '');
$description = trim($data['description'] ?? '');
$lodge_email = trim($data['lodge_email'] ?? '');
$type = trim($data['type'] ?? '');
$lodge_nin = trim($data['lodge_nin'] ?? '');
$price = is_numeric($data['price']) ? (float)$data['price'] : null;
$startDate = !empty($data['startDate']) ? date('Y-m-d', strtotime($data['startDate'])) : null;
$endDate = !empty($data['endDate']) ? date('Y-m-d', strtotime($data['endDate'])) : null;
$nights = is_numeric($data['nights']) ? (int)$data['nights'] : 0;

// Image URLs
$image_first_url = trim($data['image_first_url'] ?? '');
$image_second_url = trim($data['image_second_url'] ?? '');
$image_third_url = trim($data['image_third_url'] ?? '');

// Owner contact fields
$owner_email = trim($data['owner_email'] ?? '');
$owner_mobile = trim($data['owner_mobile'] ?? '');
$owner_phone = trim($data['owner_phone'] ?? '');

// === PHPMailer setup ===
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// === HTML receipt generator ===
function generate_payment_receipt_html($data) {
    $logoUrl = 'https://lodge.morelinks.com.ng/logo.png';
    $amountFormatted = '₦' . number_format($data['amount'] ?? 0, 2);
    $reference = htmlspecialchars($data['reference'] ?? '');
    $fullname = htmlspecialchars($data['fullname'] ?? '');
    $email = htmlspecialchars($data['email'] ?? '');
    $mobile = htmlspecialchars($data['mobile'] ?? '-');
    $lodge_title = htmlspecialchars($data['lodge_title'] ?? '-');
    $lodge_location = htmlspecialchars($data['lodge_location'] ?? '-');
    $startDate = htmlspecialchars($data['startDate'] ?? '-');
    $endDate = htmlspecialchars($data['endDate'] ?? '-');
    $nights = htmlspecialchars($data['nights'] ?? '-');
    $provider = htmlspecialchars($data['channel'] ?? '-');
    $paymentMethod = strtoupper($data['channel'] ?? '-');
    $transactionDate = htmlspecialchars($data['paid_at'] ?? '-');
    $owner_email = htmlspecialchars($data['owner_email'] ?? 'Not provided');
    $owner_mobile = htmlspecialchars($data['owner_mobile'] ?? 'Not provided');
    $owner_phone = htmlspecialchars($data['owner_phone'] ?? 'Not provided');
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Payment Receipt</title>
<style>
body { font-family: 'Segoe UI', sans-serif; background: #f5f6f8; margin: 0; padding: 30px; }
.card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 24px; }
.logo { display: block; margin: 0 auto 20px; max-width: 140px; background: #0055cc; padding: 8px 16px; border-radius: 8px; }
h1 { font-size: 22px; margin-bottom: 4px; color: #222; }
h3 { margin-top: 24px; font-size: 14px; color: #555; text-transform: uppercase; }
p, td { color: #333; font-size: 14px; line-height: 1.6; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table td { padding: 8px 4px; border-bottom: 1px solid #eee; }
.footer { text-align: center; font-size: 12px; color: #888; margin-top: 30px; }
</style>
</head>
<body>
<div class="card">
    <img src="<?= $logoUrl ?>" alt="Morelinks Logo" class="logo" />
    <h1>Payment Receipt</h1>
    <p style="color:#777;">Reference: <strong><?= $reference ?></strong></p>

    <h3>Payer</h3>
    <p>
        <strong><?= $fullname ?></strong><br>
        <?= $email ?><br>
        <?= $mobile ?>
    </p>

    <h3>Lodge</h3>
    <p>
        <strong><?= $lodge_title ?></strong><br>
        <?= $lodge_location ?>
    </p>

    <h3>Payment Details</h3>
    <table class="table">
        <tr><td>Payment Provider</td><td><?= $provider ?></td></tr>
        <tr><td>Amount Paid</td><td><strong><?= $amountFormatted ?></strong></td></tr>
        <tr><td>Transaction Date</td><td><?= $transactionDate ?></td></tr>
        <tr><td>Transaction Reference</td><td><?= $reference ?></td></tr>
        <tr><td>Payment Method</td><td><?= $paymentMethod ?></td></tr>
        <tr><td>Start Date</td><td><?= $startDate ?></td></tr>
        <tr><td>End Date</td><td><?= $endDate ?></td></tr>
        <tr><td>Number of Nights</td><td><?= $nights ?></td></tr>
    </table>

    <h3>Owner Contact</h3>
    <p>
        <strong>Email:</strong> <?= $owner_email ?><br>
        <strong>Mobile:</strong> <?= $owner_mobile ?><br>
        <strong>Phone:</strong> <?= $owner_phone ?>
    </p>

    <div class="footer">
        This is an electronic receipt. No signature is required.<br>
        © <?= date('Y') ?> Morelinks Lodge
    </div>
</div>
</body>
</html>
<?php
}

// === Save payment to database ===
try {
    $db = new Database();
    $pdo = $db->connect();

    // Prevent duplicate reference
    $check = $pdo->prepare("SELECT id FROM payments WHERE reference = :ref LIMIT 1");
    $check->execute([':ref' => $reference]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Duplicate reference — payment already saved.']);
        exit;
    }

    $sql = "INSERT INTO payments (
        fullname, email, nin, mobile, gender, channel, amount, reference, paid_at,
        lodge_title, lodge_location, amenities, bathroomType, capacity, description,
        lodge_email, type, lodge_nin, price, startDate, endDate, nights,
        image_first_url, image_second_url, image_third_url,
        owner_email, owner_mobile, owner_phone,
        order_id, created_at
    ) VALUES (
        :fullname, :email, :nin, :mobile, :gender, :channel, :amount, :reference, :paid_at,
        :lodge_title, :lodge_location, :amenities, :bathroomType, :capacity, :description,
        :lodge_email, :type, :lodge_nin, :price, :startDate, :endDate, :nights,
        :image_first_url, :image_second_url, :image_third_url,
        :owner_email, :owner_mobile, :owner_phone,
        :order_id, NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':fullname' => $fullname,
        ':email' => $email,
        ':nin' => $nin,
        ':mobile' => $mobile,
        ':gender' => $gender,
        ':channel' => $channel,
        ':amount' => $amount,
        ':reference' => $reference,
        ':paid_at' => $paid_at,
        ':lodge_title' => $lodge_title,
        ':lodge_location' => $lodge_location,
        ':amenities' => $amenities,
        ':bathroomType' => $bathroomType,
        ':capacity' => $capacity,
        ':description' => $description,
        ':lodge_email' => $lodge_email,
        ':type' => $type,
        ':lodge_nin' => $lodge_nin,
        ':price' => $price,
        ':startDate' => $startDate,
        ':endDate' => $endDate,
        ':nights' => $nights,
        ':image_first_url' => $image_first_url,
        ':image_second_url' => $image_second_url,
        ':image_third_url' => $image_third_url,
        ':owner_email' => $owner_email,
        ':owner_mobile' => $owner_mobile,
        ':owner_phone' => $owner_phone,
        ':order_id' => $order_id,
    ]);

    $insertId = $pdo->lastInsertId();

    // If start/end dates provided, attempt to create a booking record
    if ($insertId && $startDate && $endDate) {
        try {
            // Determine lodge_id: prefer explicit lodge_id from payload, otherwise try to match by title
            $lodge_id = null;
            if (!empty($data['lodge_id']) && is_numeric($data['lodge_id'])) {
                $lodge_id = (int)$data['lodge_id'];
            } elseif (!empty($lodge_title)) {
                $q = $pdo->prepare("SELECT id FROM lodges WHERE title = :title LIMIT 1");
                $q->execute([':title' => $lodge_title]);
                $r = $q->fetch(PDO::FETCH_ASSOC);
                if ($r) $lodge_id = (int)$r['id'];
            }

            if ($lodge_id) {
                // Check for overlapping confirmed bookings
                $c = $pdo->prepare("SELECT id FROM bookings WHERE lodge_id = :lid AND status = 'booked' AND NOT (end_date < :start OR start_date > :end) LIMIT 1");
                $c->execute([':lid' => $lodge_id, ':start' => $startDate, ':end' => $endDate]);
                $conf = $c->fetch(PDO::FETCH_ASSOC);
                if ($conf) {
                    // mark booking as conflict
                    $ins = $pdo->prepare("INSERT INTO bookings (lodge_id, user_uid, payment_id, start_date, end_date, nights, status, notes, created_at) VALUES (:lid, :uid, :pid, :start, :end, :nights, 'conflict', :notes, NOW())");
                    $ins->execute([
                        ':lid' => $lodge_id,
                        ':uid' => $data['userUid'] ?? null,
                        ':pid' => $insertId,
                        ':start' => $startDate,
                        ':end' => $endDate,
                        ':nights' => $nights,
                        ':notes' => 'Auto-created after payment; conflict with existing booking',
                    ]);
                } else {
                    $ins = $pdo->prepare("INSERT INTO bookings (lodge_id, user_uid, payment_id, start_date, end_date, nights, status, created_at) VALUES (:lid, :uid, :pid, :start, :end, :nights, 'booked', NOW())");
                    $ins->execute([
                        ':lid' => $lodge_id,
                        ':uid' => $data['userUid'] ?? null,
                        ':pid' => $insertId,
                        ':start' => $startDate,
                        ':end' => $endDate,
                        ':nights' => $nights,
                    ]);
                }
            }
        } catch (Exception $e) {
            // Do not fail the payment save if booking creation errors; log for investigation
            error_log("Booking create after payment failed: " . $e->getMessage() . "\n", 3, __DIR__ . '/booking_debug.log');
        }
    }

    // === Send email receipt to user and admin ===
    ob_start();
    generate_payment_receipt_html($data);
    $htmlBody = ob_get_clean();
    $subject = "Payment Receipt - Reference: " . $reference;
    $fromEmail = 'admin@morelinks.com.ng';
    $fromName = 'Morelinks Lodge';

    $recipients = [$email, 'xploremorelinks@gmail.com'];

    foreach ($recipients as $to) {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = 'mail.morelinks.com.ng';
            $mail->SMTPAuth = true;
            $mail->Username = 'admin@morelinks.com.ng';
            $mail->Password = '9652Aa@!@!@!@';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = 465;

            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);

            $mail->send();
        } catch (Exception $e) {
            error_log("Email receipt failed for {$to}: " . $e->getMessage() . "\n", 3, __DIR__ . '/email_debug.log');
        }
    }

    echo json_encode(['success' => true, 'insert_id' => $insertId, 'email_sent' => true]);

} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
        echo json_encode(['success' => false, 'message' => 'Duplicate payment reference detected.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
