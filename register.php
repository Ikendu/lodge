<?php
// ===========================================
// Secure headers and CORS setup
// ===========================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight request (for OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===========================================
// Include database config
// ===========================================
require_once "config.php"; // Contains Database connection class

// ===========================================
// Customer Registration Class
// ===========================================
class RegisterCustomer {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    private function sanitize($data) {
        return htmlspecialchars(strip_tags(trim($data)));
    }

    private function customerExists($nin) {
        $query = "SELECT id FROM customers WHERE nin = :nin LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nin", $nin);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function uploadImage($file) {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) return null;

        $targetDir = __DIR__ . "/uploads/";
        if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png'];
        if (!in_array($ext, $allowed)) {
            throw new Exception("Invalid image format. Only JPG, JPEG, PNG allowed.");
        }

        $fileName = uniqid("IMG_", true) . "." . $ext;
        $targetPath = $targetDir . $fileName;

        if (move_uploaded_file($file["tmp_name"], $targetPath)) {
            return "uploads/" . $fileName; // relative path for frontend
        }
        return null;
    }

    public function register($data, $files) {
        $nin = $this->sanitize($data['nin'] ?? '');
        if (empty($nin)) {
            return ["success" => false, "message" => "NIN is required"];
        }

        if ($this->customerExists($nin)) {
            return ["success" => false, "message" => "Customer already exists"];
        }

        // Upload image
        $uploadedImage = $this->uploadImage($files['image'] ?? null);

        // Prepare SQL
        $query = "INSERT INTO customers (
            userUid, userLoginMail, firstName, middleName, lastName,
            nin, phone, mobile, birth_country, birth_lga, birth_state,
            gender, verified_image, verified_signature, nin_email,
            address, addressLga, addressState, permanentAddress,
            lga, state, country, image, created_at
        ) VALUES (
            :userUid, :userLoginMail, :firstName, :middleName, :lastName,
            :nin, :phone, :mobile, :birth_country, :birth_lga, :birth_state,
            :gender, :verified_image, :verified_signature, :nin_email,
            :address, :addressLga, :addressState, :permanentAddress,
            :lga, :state, :country, :image, NOW()
        )";

        $stmt = $this->conn->prepare($query);

        // Bind values
        $fields = [
            "userUid", "userLoginMail", "firstName", "middleName", "lastName",
            "nin", "phone", "mobile", "birth_country", "birth_lga", "birth_state",
            "gender", "verified_image", "verified_signature", "nin_email",
            "address", "addressLga", "addressState", "permanentAddress",
            "lga", "state", "country"
        ];
        foreach ($fields as $f) {
            $stmt->bindValue(":$f", $this->sanitize($data[$f] ?? ""));
        }
        $stmt->bindValue(":image", $uploadedImage);

        try {
            $result = $stmt->execute();
            if ($result) {
                return ["success" => true, "message" => "Customer registered successfully"];
            } else {
                return ["success" => false, "message" => "Registration failed during execution."];
            }
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Database error: " . $e->getMessage()];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
}

// ===========================================
// Main Execution
// ===========================================
try {
    $database = new Database();
    $db = $database->connect();
    $register = new RegisterCustomer($db);

    $response = $register->register($_POST, $_FILES);

    echo json_encode($response, JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
