<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$item_id = $data['item_id'] ?? null;

if (!$item_id) {
    echo json_encode(['success' => false, 'message' => 'Missing item_id.']);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM procurement_items WHERE id = ? AND status = 'Approved'");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();
$item = $result->fetch_assoc();
$stmt->close();

if (!$item) {
    echo json_encode(['success' => false, 'message' => 'Item not found or not approved.']);
    exit;
}

$type = $data['type'] ?? $item['type'];
$brand = $data['brand'] ?? $item['brand'];
$serialNumber = $data['serial_number'] ?? $item['serial_number'];
$issuedDate = $data['issued_date'] ?? $item['issued_date'];
$purchaseDate = $data['purchase_date'] ?? $item['purchase_date'];
$condition = $data['condition'] ?? $item['condition'];
$location = $data['location'] ?? $item['location'];
$status = 'On Stock';
$remarks = $data['remarks'] ?? $item['remarks'];
$quantity = intval($data['quantity'] ?? $item['quantity']);

$purchaseDateFormatted = date("Ymd", strtotime($purchaseDate));
$query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
$stmt = $conn->prepare($query);
$likeParam = $purchaseDateFormatted . "%";
$stmt->bind_param("s", $likeParam);
$stmt->execute();
$stmt->bind_result($lastId);
$stmt->fetch();
$stmt->close();

if ($lastId) {
    $lastCounter = (int)substr($lastId, -4);
    $newCounter = str_pad($lastCounter + 1, 4, "0", STR_PAD_LEFT);
} else {
    $newCounter = "0001";
}
$newId = $purchaseDateFormatted . $newCounter;

$stmt = $conn->prepare("INSERT INTO inventory (id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssssi", $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity);

if ($stmt->execute()) {
    $stmt->close();
    $history_stmt = $conn->prepare("INSERT INTO history (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $history_action = 'Added';
    $history_stmt->bind_param("sssssssssssi", $history_action, $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity);
    $history_stmt->execute();
    $history_stmt->close();
    $updateStmt = $conn->prepare("UPDATE procurement_items SET status = 'AddedToInventory' WHERE id = ?");
    $updateStmt->bind_param("i", $item_id);
    $updateStmt->execute();
    $updateStmt->close();
    echo json_encode(['success' => true, 'message' => 'Item added to inventory.', 'inventory_id' => $newId]);
} else {
    $stmt->close();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $conn->error]);
}
$conn->close(); 