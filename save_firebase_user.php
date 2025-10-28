<?php
// save_firebase_user.php
// Verifies Firebase ID token (using Google's tokeninfo endpoint) and upserts firebase_uid + email into customers table.

header("Access-Control-Allow-Origin: *"); // adjust to your production origin as needed
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // CORS preflight
    http_response_code(204);
    exit;
}

// Read JSON body
$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];

$idToken = $body['idToken'] ?? null;
$providedUid = $body['uid'] ?? null;
$providedEmail = $body['email'] ?? null;

if (!$idToken) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'idToken is required']);
    exit;
}

// Verify token via Google's tokeninfo endpoint (no external PHP libraries required)
$tokenInfoUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
$resp = @file_get_contents($tokenInfoUrl);
if ($resp === false) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token verification failed']);
    exit;
}

$info = json_decode($resp, true);
if (!$info || isset($info['error_description'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid ID token', 'detail' => $info]);
    exit;
}

// tokeninfo returns fields such as 'sub' (uid), 'email', 'aud', 'iss'.
$tokenUid = $info['sub'] ?? null;
$tokenEmail = $info['email'] ?? null;

if (!$tokenUid) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'ID token missing subject (sub)']);
    exit;
}

// Optional: verify provided uid matches token's sub
if ($providedUid && $providedUid !== $tokenUid) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Provided uid does not match token subject']);
    exit;
}

// Use email from token if not provided
if (!$providedEmail) $providedEmail = $tokenEmail ?? null;

require_once __DIR__ . '/api/config.php';

try {
    $database = new Database();
    $db = $database->connect();

    // Check if customers table has firebase_uid column
    $hasFirebaseCol = false;
    try {
        $check = $db->query("SHOW COLUMNS FROM customers LIKE 'firebase_uid'");
        if ($check && $check->rowCount() > 0) $hasFirebaseCol = true;
    } catch (Exception $e) {
        // ignore
    }

    // If column doesn't exist, attempt an upsert by email only
    if (!$hasFirebaseCol) {
        // Find existing by email
        if (!$providedEmail) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No email available to link user. Add firebase_uid column to enable uid linking.']);
            exit;
        }

        // Try to find by email
        $stmt = $db->prepare("SELECT * FROM customers WHERE email = :email LIMIT 1");
        $stmt->bindValue(':email', $providedEmail);
        $stmt->execute();
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Return the profile as-is (no uid to store)
            echo json_encode(['success' => true, 'message' => 'Profile found (no firebase_uid column to update)', 'profile' => $existing]);
            exit;
        } else {
            // Insert minimal record
            $ins = $db->prepare("INSERT INTO customers (email) VALUES (:email)");
            $ins->bindValue(':email', $providedEmail);
            $ins->execute();
            $id = $db->lastInsertId();
            $stmt = $db->prepare("SELECT * FROM customers WHERE id = :id LIMIT 1");
            $stmt->bindValue(':id', $id);
            $stmt->execute();
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'message' => 'Created minimal profile (no firebase_uid column)', 'profile' => $profile]);
            exit;
        }
    }

    // When firebase_uid column exists, upsert by firebase_uid or email
    $firebaseUid = $tokenUid;

    // Try to find by firebase_uid
    $stmt = $db->prepare("SELECT * FROM customers WHERE firebase_uid = :uid LIMIT 1");
    $stmt->bindValue(':uid', $firebaseUid);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Update email if missing or different
        if ($providedEmail && ($existing['email'] !== $providedEmail)) {
            $upd = $db->prepare("UPDATE customers SET email = :email WHERE id = :id");
            $upd->bindValue(':email', $providedEmail);
            $upd->bindValue(':id', $existing['id']);
            $upd->execute();
            // refresh
            $stmt = $db->prepare("SELECT * FROM customers WHERE id = :id LIMIT 1");
            $stmt->bindValue(':id', $existing['id']);
            $stmt->execute();
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        echo json_encode(['success' => true, 'message' => 'Linked to existing profile', 'profile' => $existing]);
        exit;
    }

    // Try to find by email and set firebase_uid
    if ($providedEmail) {
        $stmt = $db->prepare("SELECT * FROM customers WHERE email = :email LIMIT 1");
        $stmt->bindValue(':email', $providedEmail);
        $stmt->execute();
        $byEmail = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($byEmail) {
            $upd = $db->prepare("UPDATE customers SET firebase_uid = :uid WHERE id = :id");
            $upd->bindValue(':uid', $firebaseUid);
            $upd->bindValue(':id', $byEmail['id']);
            $upd->execute();

            $stmt = $db->prepare("SELECT * FROM customers WHERE id = :id LIMIT 1");
            $stmt->bindValue(':id', $byEmail['id']);
            $stmt->execute();
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'message' => 'Linked firebase_uid to existing profile', 'profile' => $profile]);
            exit;
        }
    }

    // No existing profile found; create a new minimal profile with firebase_uid and email
    $ins = $db->prepare("INSERT INTO customers (firebase_uid, email) VALUES (:uid, :email)");
    $ins->bindValue(':uid', $firebaseUid);
    $ins->bindValue(':email', $providedEmail);
    $ins->execute();
    $id = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM customers WHERE id = :id LIMIT 1");
    $stmt->bindValue(':id', $id);
    $stmt->execute();
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'message' => 'Created profile and linked firebase_uid', 'profile' => $profile]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

?>