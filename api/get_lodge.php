<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Content-Type: application/json");

require_once __DIR__ . '/config.php';

$id = isset($_GET['id']) ? trim($_GET['id']) : '';
$title = isset($_GET['title']) ? trim($_GET['title']) : '';

if ($id === '' && $title === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide id or title']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    if ($id !== '') {
        $sql = 'SELECT id, userUid, userLoginMail, nin, title, location, price, availability, type, description, amenities, capacity, bathroomType, image_first, image_second, image_third, created_at, JSON_OBJECT() AS raw FROM lodges WHERE id = :id LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
    } else {
        $sql = 'SELECT id, userUid, userLoginMail, nin, title, location, price, availability, type, description, amenities, capacity, bathroomType, image_first, image_second, image_third, created_at, JSON_OBJECT() AS raw FROM lodges WHERE title = :title LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':title' => $title]);
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        echo json_encode(['success' => false, 'message' => 'Not found']);
        exit;
    }

    $base = 'https://lodge.morelinks.com.ng/api/lodgefiles/';
    foreach (['image_first','image_second','image_third'] as $col) {
        if (!empty($row[$col])) {
            $row[$col . '_url'] = $base . rawurlencode($row[$col]);
        } else {
            $row[$col . '_url'] = null;
        }
    }

    // If we have an id, fetch upcoming bookings for this lodge
    if (!empty($row['id'])) {
        try {
            $bstmt = $pdo->prepare("SELECT id, start_date as startDate, end_date as endDate, nights, status FROM bookings WHERE lodge_id = :lid AND status = 'booked' AND end_date >= CURDATE() ORDER BY start_date");
            $bstmt->execute([':lid' => $row['id']]);
            $bookings = $bstmt->fetchAll(PDO::FETCH_ASSOC);
            $row['bookings'] = $bookings;
        } catch (Exception $e) {
            $row['bookings'] = [];
        }
    } else {
        $row['bookings'] = [];
    }

    echo json_encode(['success' => true, 'data' => $row]);
    exit;
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}
