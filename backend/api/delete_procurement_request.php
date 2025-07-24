<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Authorization token missing.']);
    exit;
}

$stmt = $conn->prepare("SELECT id, role, token_expiry FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows !== 1) {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
    exit;
}
$stmt->bind_result($user_id, $role, $token_expiry);
$stmt->fetch();
if ($token_expiry !== null && $token_expiry < time()) {
    echo json_encode(['success' => false, 'message' => 'Token expired.']);
    exit;
}
$stmt->close();

$data = json_decode(file_get_contents('php://input'), true);
$request_id = $data['request_id'] ?? null;

if (!$request_id) {
    echo json_encode(['success' => false, 'message' => 'Missing request_id.']);
    exit;
}

$stmt = $conn->prepare("SELECT requester_id FROM procurement_requests WHERE id = ?");
$stmt->bind_param("i", $request_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows !== 1) {
    echo json_encode(['success' => false, 'message' => 'Procurement request not found.']);
    exit;
}
$stmt->bind_result($requester_id);
$stmt->fetch();
$stmt->close();

if ($role !== 'admin' && $user_id != $requester_id) {
    echo json_encode(['success' => false, 'message' => 'You are not authorized to delete this request.']);
    exit;
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("DELETE FROM procurement_items WHERE request_id = ?");
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM procurement_requests WHERE id = ?");
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Procurement request deleted successfully.']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
$conn->close(); 