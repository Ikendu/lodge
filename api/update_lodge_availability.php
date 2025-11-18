<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once __DIR__ . '/config.php';

$dbClass = new Database();
$pdo = $dbClass->connect();

$respLog = __DIR__ . '/lodge_update_debug.log';

try {
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    if (!$json) $json = $_POST;

    $id = isset($json['id']) ? (int)$json['id'] : 0;
    $availability = isset($json['availability']) ? (int)$json['availability'] : null;

    if (!$id || !is_numeric($id) || $availability === null) {
        echo json_encode(['success' => false, 'message' => 'Missing id or availability']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE lodges SET availability = :availability WHERE id = :id');
    $stmt->execute([':availability' => $availability ? 1 : 0, ':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'Availability updated']);
    exit;
} catch (Exception $e) {
    error_log('update_lodge_availability error: ' . $e->getMessage() . "\n", 3, $respLog);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}

?>
