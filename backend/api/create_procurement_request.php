<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Authorization token missing.']);
    exit;
}

$stmt = $conn->prepare("SELECT id, token_expiry FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows !== 1) {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
    exit;
}
$stmt->bind_result($requester_id, $token_expiry);
$stmt->fetch();
if ($token_expiry !== null && $token_expiry < time()) {
    echo json_encode(['success' => false, 'message' => 'Token expired.']);
    exit;
}
$stmt->close();

$department = $data['department'] ?? null;
$remarks = $data['remarks'] ?? '';
$items = $data['items'] ?? [];

error_log('requester_id: ' . var_export($requester_id, true));
error_log('department: ' . var_export($department, true));
error_log('items: ' . var_export($items, true));

if (empty($department) || !is_array($items) || count($items) === 0) {
    $missing = [];
    if (empty($department)) $missing[] = 'department';
    if (!is_array($items) || count($items) === 0) $missing[] = 'items';
    echo json_encode(['success' => false, 'message' => 'Missing required fields: ' . implode(', ', $missing)]);
    exit;
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("INSERT INTO procurement_requests (requester_id, department, request_date, status, remarks) VALUES (?, ?, NOW(), 'Pending', ?)");
    $stmt->bind_param("iss", $requester_id, $department, $remarks);
    $stmt->execute();
    $request_id = $stmt->insert_id;
    $stmt->close();

    $itemStmt = $conn->prepare("INSERT INTO procurement_items (request_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($items as $item) {
        $type = $item['type'] ?? '';
        $brand = $item['brand'] ?? '';
        $serial_number = $item['serial_number'] ?? '';
        $issued_date = null;
        $purchase_date = $item['purchase_date'] ?? null;
        $condition = 'Brand New'; 
        $location = $item['location'] ?? '';
        $status = $item['status'] ?? 'Requested';
        $item_remarks = $item['remarks'] ?? '';
        $quantity = intval($item['quantity'] ?? 1);
        $itemStmt->bind_param(
            "isssssssssi",
            $request_id,
            $type,
            $brand,
            $serial_number,
            $issued_date,
            $purchase_date,
            $condition,
            $location,
            $status,
            $item_remarks,
            $quantity
        );
        $itemStmt->execute();
    }
    $itemStmt->close();
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Procurement request created successfully.']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
$conn->close(); 