<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once "config.php";

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
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $targetDir = "uploads/";
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $fileExt = pathinfo($file["name"], PATHINFO_EXTENSION);
        $fileName = uniqid("IMG_") . "." . $fileExt;
        $targetFilePath = $targetDir . $fileName;

        $check = getimagesize($file["tmp_name"]);
        if ($check === false) {
            return null;
        }

        if (move_uploaded_file($file["tmp_name"], $targetFilePath)) {
            return $targetFilePath;
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

        $query = "INSERT INTO customers (
            userUid, userLoginMail, firstName, middleName, lastName, nin, nin_address, dob,
            phone, mobile, birth_country, birth_lga, birth_state, gender,
            verified_image, verified_signature, nin_email, address, addressLga, addressState,
            permanentAddress, email, lga, state, country,
            nextOfKinName, nextOfKinPhone, nextOfKinAddress, nextOfKinRelation, image, created_at
        ) VALUES (
            :userUid, :userLoginMail, :firstName, :middleName, :lastName, :nin, :nin_address, :dob,
            :phone, :mobile, :birth_country, :birth_lga, :birth_state, :gender,
            :verified_image, :verified_signature, :nin_email, :address, :addressLga, :addressState,
            :permanentAddress, :email, :lga, :state, :country,
            :nextOfKinName, :nextOfKinPhone, :nextOfKinAddress, :nextOfKinRelation, :image, NOW()
        )";

        $stmt = $this->conn->prepare($query);

        $uploadedImage = $this->uploadImage($files['image'] ?? null);

        // Bind parameters safely
        $fields = [
            "userUid", "userLoginMail", "firstName", "middleName", "lastName", "nin",
            "nin_address", "dob", "phone", "mobile", "birth_country", "birth_lga",
            "birth_state", "gender", "verified_image", "verified_signature", "nin_email",
            "address", "addressLga", "addressState", "permanentAddress", "email", "lga",
            "state", "country", "nextOfKinName", "nextOfKinPhone", "nextOfKinAddress", "nextOfKinRelation"
        ];

        foreach ($fields as $field) {
            $stmt->bindValue(":$field", $this->sanitize($data[$field] ?? ''));
        }

        $stmt->bindValue(":image", $uploadedImage ?? '');

        try {
            if ($stmt->execute()) {
                $insertedId = $this->conn->lastInsertId();

                // Fetch the full record
                $fetchQuery = "SELECT * FROM customers WHERE id = :id LIMIT 1";
                $fetchStmt = $this->conn->prepare($fetchQuery);
                $fetchStmt->bindParam(":id", $insertedId);
                $fetchStmt->execute();
                $customerData = $fetchStmt->fetch(PDO::FETCH_ASSOC);

                return [
                    "success" => true,
                    "message" => "Customer registered successfully!",
                    "data" => $customerData
                ];
            } else {
                return ["success" => false, "message" => "Failed to register customer"];
            }
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Database error: " . $e->getMessage()];
        }
    }
}

// --- Initialize DB Connection and Handle Request ---
$database = new Database();
$db = $database->connect();
$customer = new RegisterCustomer($db);
$response = $customer->register($_POST, $_FILES);
echo json_encode($response);
?>
