<?php
// get_profile.php
// Returns a user's profile by firebase_uid, email, or phone, and includes activities if an activities table exists.

header("Access-Control-Allow-Origin: http://localhost:5173"); // change as needed
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uid = $_GET['uid'] ?? null;
$email = $_GET['email'] ?? null;
$phone = $_GET['phone'] ?? null;

if (!$uid && !$email && !$phone) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provide uid, email, or phone']);
    exit;
}

// Database connection (same pattern)
class ConfigLocal2 {
    private $host = "localhost";
    private $db_name = "lodge";
    private $username = "root";
    private $password = "";
    public $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }
        return $this->conn;
    }
}

try {
    $db = (new ConfigLocal2())->connect();

    // Build query
    $conds = [];
    $params = [];
    if ($uid) {
        $conds[] = "firebase_uid = :uid";
        $params[':uid'] = $uid;
    }
    if ($email) {
        $conds[] = "email = :email";
        $params[':email'] = $email;
    }
    if ($phone) {
        $conds[] = "phone = :phone";
        $params[':phone'] = $phone;
    }

    $sql = "SELECT * FROM customers WHERE " . implode(' OR ', $conds) . " LIMIT 1";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        echo json_encode(['success' => false, 'message' => 'Profile not found']);
        exit;
    }

    $result = ['success' => true, 'profile' => $profile];

    // If activities table exists, try to fetch related activities using columns that exist
    $activities = [];
    try {
        $check = $db->query("SHOW TABLES LIKE 'activities'");
        if ($check && $check->rowCount() > 0) {
            // Determine which linking columns exist in activities table
            $colsStmt = $db->query("SHOW COLUMNS FROM activities");
            $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN, 0);

            $actConds = [];
            $actParams = [];
            if (in_array('customer_id', $cols) && isset($profile['id'])) {
                $actConds[] = 'customer_id = :cid';
                $actParams[':cid'] = $profile['id'];
            }
            if (in_array('user_email', $cols) && isset($profile['email'])) {
                $actConds[] = 'user_email = :uemail';
                $actParams[':uemail'] = $profile['email'];
            }
            if (in_array('firebase_uid', $cols) && isset($profile['firebase_uid'])) {
                $actConds[] = 'firebase_uid = :fuid';
                $actParams[':fuid'] = $profile['firebase_uid'];
            }

            if (count($actConds) > 0) {
                $actSql = 'SELECT * FROM activities WHERE ' . implode(' OR ', $actConds) . ' ORDER BY created_at DESC LIMIT 200';
                $actStmt = $db->prepare($actSql);
                foreach ($actParams as $k => $v) $actStmt->bindValue($k, $v);
                $actStmt->execute();
                $activities = $actStmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
    } catch (Exception $e) {
        // ignore activity fetch errors
    }

    $result['activities'] = $activities;

    echo json_encode($result);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

?>