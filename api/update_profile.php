<?php
header('Content-Type: application/json; charset=utf-8');

// CORS for development; adjust in production
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$email = trim($data['email'] ?? '');
$nin = trim($data['nin'] ?? '');

if ($email === '' && $nin === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing identifier (email or nin)']);
    exit;
}

// allowed fields mapping: incoming -> DB column
$allowed = [
    'contact_address' => 'address',
    'permanent_address' => 'permanentAddress',
    'mobile' => 'mobile',
    'nextOfKinName' => 'nextOfKinName',
    'nextOfKinPhone' => 'nextOfKinPhone',
    'nextOfKinAddress' => 'nextOfKinAddress',
    'nextOfKinRelation' => 'nextOfKinRelation',
];

$updates = [];
$params = [];
foreach ($allowed as $in => $col) {
    if (array_key_exists($in, $data)) {
        $updates[] = "`$col` = :$col";
        $params[":$col"] = $data[$in] === '' ? null : $data[$in];
    }
}

if (count($updates) === 0) {
    echo json_encode(['success' => false, 'message' => 'No updatable fields provided']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    // Build WHERE clause using email or nin
    $where = '';
    if ($email !== '') {
        $where = 'userLoginMail = :email';
        $params[':email'] = $email;
    }
    if ($where === '' && $nin !== '') {
        $where = 'nin = :nin';
        $params[':nin'] = $nin;
    }
    if ($where === '' && $nin !== '' && $email !== '') {
        $where = '(userLoginMail = :email OR nin = :nin)';
        $params[':nin'] = $nin;
    }

    // Update profiles table - adjust table name if your project stores profiles in a different table
    $sql = 'UPDATE customers SET ' . implode(', ', $updates) . ' WHERE ' . $where . ' LIMIT 1';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }

    $ok = $stmt->execute();
    $rows = $stmt->rowCount();

    if ($ok) {
        echo json_encode(['success' => true, 'rows_affected' => $rows]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Update failed']);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}

?>
