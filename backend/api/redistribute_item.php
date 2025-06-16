<?php
include('cors.php');
include('database.php');

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['id'], $data['newQuantity'], $data['newLocation'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

// Sanitize input
$id = $data['id'];
$newQuantity = intval($data['newQuantity']);
$newLocation = htmlspecialchars(trim($data['newLocation']));

// Fetch existing item
$query = "SELECT * FROM inventory WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();
$existingItem = $result->fetch_assoc();
$stmt->close();

if (!$existingItem) {
    http_response_code(404);
    echo json_encode(["message" => "Original item not found."]);
    exit();
}

if (intval($existingItem['quantity']) <= 1) {
    http_response_code(400);
    echo json_encode(["message" => "Item quantity is already 1. Redistribution not allowed."]);
    exit();
}

// Now it's safe to use $existingItem
$status = isset($data['status']) ? htmlspecialchars(trim($data['status'])) : $existingItem['status'];
$remarks = isset($data['remarks']) ? htmlspecialchars(trim($data['remarks'])) : $existingItem['remarks'];
$issuedDate = isset($data['issued_date']) ? $data['issued_date'] : $existingItem['issued_date'];
$condition = isset($data['condition']) ? htmlspecialchars(trim($data['condition'])) : $existingItem['condition'];

// Check quantity
$remainingQty = intval($existingItem['quantity']) - $newQuantity;
if ($remainingQty < 0) {
    http_response_code(400);
    echo json_encode(["message" => "New quantity exceeds available stock."]);
    exit();
}

// Update original item quantity
$updateQuery = "UPDATE inventory SET quantity = ? WHERE id = ?";
$updateStmt = $conn->prepare($updateQuery);
$updateStmt->bind_param("is", $remainingQty, $id);
if (!$updateStmt->execute()) {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update original item."]);
    exit();
}
$updateStmt->close();

// Generate new item ID based on purchase date
$purchaseDateFormatted = date("Ymd", strtotime($existingItem['purchase_date']));
$likeParam = $purchaseDateFormatted . "%";
$checkQuery = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("s", $likeParam);
$checkStmt->execute();
$checkStmt->bind_result($lastItemId);
$checkStmt->fetch();
$checkStmt->close();

if ($lastItemId && preg_match('/^' . $purchaseDateFormatted . '(\d{1,4})$/', $lastItemId, $matches)) {
    $lastCounter = (int)$matches[1];
    $newCounter = str_pad($lastCounter + 1, 4, "0", STR_PAD_LEFT);
} else {
    $newCounter = "0001";
}
$newItemId = $purchaseDateFormatted . $newCounter;

// Insert new redistributed item
$insertQuery = "
    INSERT INTO inventory (
        id, type, brand, serial_number, issued_date, purchase_date,
        `condition`, location, status, remarks, quantity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";
$insertStmt = $conn->prepare($insertQuery);
$insertStmt->bind_param(
    "ssssssssssi",
    $newItemId,
    $existingItem['type'],
    $existingItem['brand'],
    $existingItem['serial_number'],
    $issuedDate,
    $existingItem['purchase_date'],
    $condition,
    $newLocation,
    $status,
    $remarks,
    $newQuantity
);

$insertSuccess = $insertStmt->execute();
$insertStmt->close();

// Log the update of the original item
$changeField = json_encode(["Quantity"]);
$oldValue = json_encode([$existingItem['quantity']]);
$newValue = json_encode([$remainingQty]);

$logUpdateStmt = $conn->prepare("
    INSERT INTO history (action, item_id, field_changed, old_value, new_value, action_date)
    VALUES ('Updated', ?, ?, ?, ?, NOW())
");
$logUpdateStmt->bind_param("ssss", $id, $changeField, $oldValue, $newValue);
$logUpdateStmt->execute();
$logUpdateStmt->close();

// Log the creation of the new redistributed item as "Added"
$logAddStmt = $conn->prepare("
    INSERT INTO history (
        action, item_id, type, brand, serial_number, issued_date, purchase_date,
        `condition`, location, status, remarks, quantity, action_date
    ) VALUES (
        'Added', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
    )
");
$logAddStmt->bind_param(
    "ssssssssssi",
    $newItemId,
    $existingItem['type'],
    $existingItem['brand'],
    $existingItem['serial_number'],
    $existingItem['issued_date'],
    $existingItem['purchase_date'],
    $existingItem['condition'],
    $newLocation,
    $existingItem['status'],
    $existingItem['remarks'],
    $newQuantity
);
$logAddStmt->execute();
$logAddStmt->close();

if ($insertSuccess) {
    echo json_encode([
        "message" => "Redistribution successful.",
        "new_item_id" => $newItemId,
        "remaining_quantity" => $remainingQty
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error inserting redistributed item."]);
}

$conn->close();
?>
