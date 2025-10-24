<?php
// Secure headers and CORS
header("Access-Control-Allow-Origin: http://localhost:5173"); // change to your frontend domain
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// ===========================
// CONFIGURATION CLASS
// ===========================
class Config {
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
            echo json_encode(["success" => false, "message" => "Database connection failed"]);
            exit;
        }
        return $this->conn;
    }
}

// ===========================
// USER CLASS
// ===========================
class User {
    private $conn;
    private $table = "customers";

    public function __construct($db) {
        $this->conn = $db;
    }

    // --- CHECK IF USER EXISTS ---
    public function exists($nin, $phone) {
        $sql = "SELECT id FROM {$this->table} WHERE nin = :nin OR phone = :phone LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":nin", $nin);
        $stmt->bindValue(":phone", $phone);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // --- REGISTER USER ---
    public function register($data, $file) {
        // Sanitize input data
        foreach ($data as $key => $value) {
            $data[$key] = htmlspecialchars(strip_tags(trim($value)));
        }

        $nin = $data["nin"] ?? null;
        $phone = $data["phone"] ?? null;

        // Check if customer already exists
        if ($this->exists($nin, $phone)) {
            throw new Exception("Customer with this NIN or phone number already exists.");
        }

        // Handle file upload if provided
        $imagePath = null;
        if ($file && isset($file["tmp_name"]) && is_uploaded_file($file["tmp_name"])) {
            $uploadDir = __DIR__ . "/uploads/";
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $allowedExts = ["jpg", "jpeg", "png"];
            $fileExt = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

            if (!in_array($fileExt, $allowedExts)) {
                throw new Exception("Invalid file type. Only JPG, JPEG, PNG allowed.");
            }

            if ($file["size"] > 2 * 1024 * 1024) {
                throw new Exception("File too large. Max 2MB allowed.");
            }

            $fileName = uniqid("img_", true) . "." . $fileExt;
            $targetPath = $uploadDir . $fileName;

            if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
                throw new Exception("File upload failed.");
            }

            $imagePath = "uploads/" . $fileName;
        }

        // Insert new record securely
        // Detect if customers table has firebase_uid column
        $hasFirebase = false;
        try {
            $check = $this->conn->query("SHOW COLUMNS FROM {$this->table} LIKE 'firebase_uid'");
            if ($check && $check->rowCount() > 0) $hasFirebase = true;
        } catch (Exception $e) {
            // ignore
        }

        $cols = [
            'first_name','middle_name','last_name','nin','phone','mobile','email','dob',
            'address','address_lga','address_state','permanent_address','lga','state','country',
            'gender','birth_country','birth_lga','birth_state','verified_image','verified_signature','nin_email','image_path'
        ];
        if ($hasFirebase) $cols[] = 'firebase_uid';

        $placeholders = array_map(function($c){ return ':' . $c; }, $cols);
        $sql = "INSERT INTO {$this->table} (" . implode(',', $cols) . ") VALUES (" . implode(',', $placeholders) . ")";
        $stmt = $this->conn->prepare($sql);

        // bind common values
        $stmt->bindValue(":first_name", $data["firstName"] ?? null);
        $stmt->bindValue(":middle_name", $data["middleName"] ?? null);
        $stmt->bindValue(":last_name", $data["lastName"] ?? null);
        $stmt->bindValue(":nin", $nin);
        $stmt->bindValue(":phone", $phone);
        $stmt->bindValue(":mobile", $data["mobile"] ?? null);
        $stmt->bindValue(":email", $data["email"] ?? null);
        $stmt->bindValue(":dob", $data["dob"] ?? null);
        $stmt->bindValue(":address", $data["address"] ?? null);
        $stmt->bindValue(":address_lga", $data["addressLga"] ?? null);
        $stmt->bindValue(":address_state", $data["addressState"] ?? null);
        $stmt->bindValue(":permanent_address", $data["permanentAddress"] ?? null);
        $stmt->bindValue(":lga", $data["lga"] ?? null);
        $stmt->bindValue(":state", $data["state"] ?? null);
        $stmt->bindValue(":country", $data["country"] ?? null);
        $stmt->bindValue(":gender", $data["gender"] ?? null);
        $stmt->bindValue(":birth_country", $data["birth_country"] ?? null);
        $stmt->bindValue(":birth_lga", $data["birth_lga"] ?? null);
        $stmt->bindValue(":birth_state", $data["birth_state"] ?? null);
        $stmt->bindValue(":verified_image", $data["verified_image"] ?? null);
        $stmt->bindValue(":verified_signature", $data["verified_signature"] ?? null);
        $stmt->bindValue(":nin_email", $data["nin_email"] ?? null);
        $stmt->bindValue(":image_path", $imagePath);

        if ($hasFirebase) {
            $stmt->bindValue(":firebase_uid", $data["firebase_uid"] ?? null);
        }

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}

// ===========================
// MAIN EXECUTION
// ===========================
try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        exit;
    }

    $database = new Config();
    $db = $database->connect();
    $user = new User($db);

    $postData = $_POST;
    $fileData = $_FILES["image"] ?? null;

    $success = $user->register($postData, $fileData);

    echo json_encode([
        "success" => $success,
        "message" => $success ? "Registration successful" : "Registration failed"
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
