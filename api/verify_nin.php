<?php
declare(strict_types=1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// For preflight OPTIONS requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Disable detailed error messages in production
error_reporting(0);

class NINVerification {
    private string $apiKey;
    private string $ninUrl = "https://api.korapay.com/merchant/api/v1/identities/ng/nin";
    private string $phoneUrl = "https://api.korapay.com/merchant/api/v1/identities/ng/nin-phone";

    public function __construct(string $apiKey) {
        $this->apiKey = $apiKey;
    }

    private function sanitizeInput(?string $value): ?string {
        return $value ? trim(filter_var($value, FILTER_SANITIZE_STRING)) : null;
    }

    public function handleRequest(): void {
        $nin = $this->sanitizeInput($_POST['nin'] ?? null);
        $phone = $this->sanitizeInput($_POST['phone'] ?? null);

        if (empty($nin) && empty($phone)) {
            $this->respond(false, "Please provide either 'nin' or 'phone'.");
        }

        if (!empty($nin)) {
            $this->verifyNIN($nin);
        } elseif (!empty($phone)) {
            $this->verifyPhone($phone);
        } else {
            $this->respond(false, "Invalid request.");
        }
    }

    private function verifyNIN(string $nin): void {
        $payload = json_encode([
            "id" => $nin,
            "verification_consent" => true
        ]);
        $this->callKoraAPI($this->ninUrl, $payload);
    }

    private function verifyPhone(string $phone): void {
        $payload = json_encode([
            "id" => $phone,
            "verification_consent" => true
        ]);
        $this->callKoraAPI($this->phoneUrl, $payload);
    }

    private function callKoraAPI(string $url, string $payload): void {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "Authorization: Bearer " . $this->apiKey,
            ],
            CURLOPT_TIMEOUT => 60,
        ]);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($err) {
            $this->respond(false, "Request error: " . $err);
        }

        $data = json_decode($response, true);
        if ($httpCode >= 400 || !is_array($data)) {
            $this->respond(false, "Verification failed (HTTP $httpCode).", $data ?: []);
        }

        $this->respond(true, "Verification successful", $data);
    }

    private function respond(bool $success, string $message, array $data = []): void {
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data,
        ]);
        exit;
    }
}

// === RUN SCRIPT ===
$apiKey = "sk_test_diVJ33chcUTmUNTeLnwaa4s8fSvDT9SqK5sJW5N5"; // Your Kora test key
$verify = new NINVerification($apiKey);
$verify->handleRequest();
