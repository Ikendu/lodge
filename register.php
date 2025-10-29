<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
require_once __DIR__ . '/api/config.php';

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
        // legacy helper kept for compatibility - not used for named save
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

        // Prepare userImage directory
        $userImageDir = __DIR__ . DIRECTORY_SEPARATOR . 'userImage' . DIRECTORY_SEPARATOR;
        if (!file_exists($userImageDir)) {
            if (!mkdir($userImageDir, 0777, true)) {
                error_log("Failed to create userImage directory: $userImageDir\n", 3, __DIR__ . '/upload_debug.log');
                return ["success" => false, "message" => "Server error: cannot create image directory"];
            }
        }

        // Helper to validate and save uploaded file to userImage with desired base name
        $saveFileWithBase = function ($fileArr, $baseName) use ($userImageDir) {
            if (!isset($fileArr) || !isset($fileArr['tmp_name']) || $fileArr['error'] !== UPLOAD_ERR_OK) return null;
            $check = @getimagesize($fileArr['tmp_name']);
            if ($check === false) return null;
            $allowed = ['jpg','jpeg','png'];
            $ext = strtolower(pathinfo($fileArr['name'], PATHINFO_EXTENSION)) ?: 'jpg';
            if (!in_array($ext, $allowed)) return null;
            $targetName = $baseName . '.' . $ext;
            $targetPath = $userImageDir . $targetName;
            if (move_uploaded_file($fileArr['tmp_name'], $targetPath)) {
                error_log("Saved uploaded file to: $targetPath\n", 3, __DIR__ . '/upload_debug.log');
                return $targetName; // return filename only
            }
            $err = error_get_last();
            error_log("move_uploaded_file failed for: {$fileArr['name']} target: $targetPath; err=" . json_encode($err) . "\n", 3, __DIR__ . '/upload_debug.log');
            return null;
        };

        $uploadedImage = null;
        $verifiedImageName = null;

        // Save given/uploaded image (field name: image)
        if (isset($files['image'])) {
            $uploadedImage = $saveFileWithBase($files['image'], $nin . '_given');
        }

        // If frontend provided a filename (string) for image (uploaded to production), use it.
        if (empty($uploadedImage) && !empty($data['image']) && is_string($data['image'])) {
            $imgVal = trim($data['image']);
            // If it's a URL or path, extract the basename to store only filename
            $path = parse_url($imgVal, PHP_URL_PATH) ?: $imgVal;
            $uploadedImage = basename($path);
        }

        // Save verified_image either from uploaded file, filename string, or base64 in POST
        if (isset($files['verified_image']) && isset($files['verified_image']['tmp_name'])) {
            $verifiedImageName = $saveFileWithBase($files['verified_image'], $nin . '_verified');
        } elseif (!empty($data['verified_image']) && is_string($data['verified_image']) && strpos($data['verified_image'], 'data:') === 0) {
            // decode data URL
            $dataUrl = $data['verified_image'];
            $parts = explode(',', $dataUrl, 2);
            if (count($parts) === 2) {
                if (preg_match('/^data:(image\/\w+);base64$/', $parts[0], $m)) {
                    $mime = $m[1];
                    $ext = str_replace('image/', '', $mime);
                    if ($ext === 'jpeg') $ext = 'jpg';
                    $bin = base64_decode($parts[1]);
                    $verifiedImageName = $nin . '_verified.' . $ext;
                    $written = file_put_contents($userImageDir . $verifiedImageName, $bin);
                    if ($written === false) {
                        error_log("Failed to write decoded verified image to: " . $userImageDir . $verifiedImageName . "\n", 3, __DIR__ . '/upload_debug.log');
                    } else {
                        error_log("Wrote decoded verified image to: " . $userImageDir . $verifiedImageName . "\n", 3, __DIR__ . '/upload_debug.log');
                    }
                }
            }
        }

        // If frontend provided a filename (string) for verified_image (uploaded to production), use it.
        if (empty($verifiedImageName) && !empty($data['verified_image']) && is_string($data['verified_image']) && strpos($data['verified_image'], 'data:') !== 0) {
            $vimgVal = trim($data['verified_image']);
            $vpath = parse_url($vimgVal, PHP_URL_PATH) ?: $vimgVal;
            $verifiedImageName = basename($vpath);
        }

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

        // bind image filename (only filename, not full path)
        $stmt->bindValue(":image", $uploadedImage ?? '');
        // override verified_image to use saved filename if present
        if ($verifiedImageName) {
            $stmt->bindValue(":verified_image", $verifiedImageName);
        }

        try {
            if ($stmt->execute()) {
                $insertedId = $this->conn->lastInsertId();

                // Fetch the full record
                $fetchQuery = "SELECT * FROM customers WHERE id = :id LIMIT 1";
                $fetchStmt = $this->conn->prepare($fetchQuery);
                $fetchStmt->bindParam(":id", $insertedId);
                $fetchStmt->execute();
                $customerData = $fetchStmt->fetch(PDO::FETCH_ASSOC);

                // Provide full public URLs for images when filenames are stored
                // public base URL where images are served — images are stored under /api/userImage/
                $baseUrl = "https://lodge.morelinks.com.ng/api/userImage/";
                if (!empty($customerData['image'])) {
                    $img = trim($customerData['image']);
                    if (!preg_match('/^(https?:\\/\\/|data:|\\/)/i', $img)) {
                        $customerData['image_url'] = $baseUrl . rawurlencode($img);
                    } else {
                        $customerData['image_url'] = $img;
                    }
                }
                if (!empty($customerData['verified_image'])) {
                    $vimg = trim($customerData['verified_image']);
                    if (!preg_match('/^(https?:\\/\\/|data:|\\/)/i', $vimg)) {
                        $customerData['verified_image_url'] = $baseUrl . rawurlencode($vimg);
                    } else {
                        $customerData['verified_image_url'] = $vimg;
                    }
                }
                // log final computed urls for debugging
                error_log("Registration saved. image_url=" . ($customerData['image_url'] ?? '') . ", verified_image_url=" . ($customerData['verified_image_url'] ?? '') . "\n", 3, __DIR__ . '/upload_debug.log');
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
