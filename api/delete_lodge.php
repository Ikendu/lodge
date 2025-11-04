<?php
header('Content-Type: application/json; charset=utf-8');
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
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

$id = intval($data['id'] ?? 0);
$userUid = trim($data['userUid'] ?? '');
$nin = trim($data['nin'] ?? '');

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing lodge id']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    // Fetch lodge and verify ownership
    $stmt = $pdo->prepare('SELECT * FROM lodges WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $lodge = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$lodge) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Lodge not found']);
        exit;
    }

    // Basic ownership check: match either userUid or nin if provided
    if ($userUid) {
        if (!isset($lodge['userUid']) || $lodge['userUid'] !== $userUid) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Not authorized to delete this lodge']);
            exit;
        }
    } elseif ($nin) {
        if (!isset($lodge['nin']) || $lodge['nin'] !== $nin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Not authorized to delete this lodge']);
            exit;
        }
    } else {
        // no owner proof supplied
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Missing owner credentials']);
        exit;
    }

    // Delete associated files if present (best-effort)
    $files = [];
    foreach (['image_first','image_second','image_third'] as $col) {
        if (!empty($lodge[$col])) $files[] = __DIR__ . '/lodgefiles/' . $lodge[$col];
    }

    // Delete DB row
    $del = $pdo->prepare('DELETE FROM lodges WHERE id = :id');
    $del->execute([':id' => $id]);

    // attempt to unlink files (ignore failures)
    foreach ($files as $f) {
        if (file_exists($f)) {
            @unlink($f);
        }
    }

    echo json_encode(['success' => true, 'message' => 'Deleted']);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}
