<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents("php://input"), true);

$id = (string)$data['id'];
$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$serialNumber = isset($data['serialNumber']) && $data['serialNumber'] !== null ? strtoupper(trim($data['serialNumber'])) : '';
$issuedDate = !empty($data['issuedDate']) ? htmlspecialchars($data['issuedDate']) : NULL;
$purchaseDate = !empty($data['purchaseDate']) ? htmlspecialchars($data['purchaseDate']) : NULL;
$condition = htmlspecialchars($data['condition']);
$location = htmlspecialchars($data['location']);
$status = htmlspecialchars($data['status']);
$remarks = htmlspecialchars($data['remarks']);
$quantity = intval($data['quantity']);

$originalId = $data['originalId'] ?? $data['id'];
$query = "SELECT * FROM inventory WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $originalId);
$stmt->execute();
$result = $stmt->get_result();
$existingItem = $result->fetch_assoc();
$stmt->close();


if (!$existingItem) {
    http_response_code(404);
    echo json_encode([
        "message" => "Item not found",
        "id" => $id,
        "debug" => [
            "query" => $query,
            "received_id" => $id,
            "originalId" => $originalId,
            "id_type" => gettype($id)
        ]
    ]);
    exit();
}

$inputPurchaseDateFormatted = date("Ymd", strtotime($purchaseDate));
$existingPurchaseDateFormatted = date("Ymd", strtotime($existingItem['purchase_date']));

$existingIdStartsWithDate = str_starts_with((string)$existingItem['id'], $inputPurchaseDateFormatted);

$needsIdFormatFix = !preg_match('/^' . $inputPurchaseDateFormatted . '\d{4}$/', $existingItem['id']);

if ($inputPurchaseDateFormatted === $existingPurchaseDateFormatted && $existingIdStartsWithDate && !$needsIdFormatFix) {
    $newItemId = $existingItem['id'];
} else {
    $purchaseDateFormatted = $inputPurchaseDateFormatted;

    $query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
    $stmt = $conn->prepare($query);
    $likeParam = $purchaseDateFormatted . "%";
    $stmt->bind_param("s", $likeParam);
    $stmt->execute();
    $stmt->bind_result($lastItemId);
    $stmt->fetch();
    $stmt->close();

    if ($lastItemId && preg_match('/^' . $purchaseDateFormatted . '(\d{1,4})$/', $lastItemId, $matches)) {
        $lastCounter = (int)$matches[1];
        $newCounter = str_pad($lastCounter + 1, 4, "0", STR_PAD_LEFT);
    } else {
        $newCounter = "0001";
    }

    $newItemId = $purchaseDateFormatted . $newCounter;
}

$changes = [];
if ($existingItem['id'] !== $newItemId) $changes['Item ID'] = ["old" => $existingItem['id'], "new" => $newItemId];
if ($existingItem['type'] !== $type) $changes['Type'] = ["old" => $existingItem['type'], "new" => $type];
if ($existingItem['brand'] !== $brand) $changes['Brand'] = ["old" => $existingItem['brand'], "new" => $brand];
if ($existingItem['serial_number'] !== $serialNumber) $changes['Serial Number'] = ["old" => $existingItem['serial_number'], "new" => $serialNumber];
if ($existingItem['issued_date'] !== $issuedDate) $changes['Issued Date'] = ["old" => $existingItem['issued_date'], "new" => $issuedDate];
if ($existingItem['purchase_date'] !== $purchaseDate) $changes['Purchase Date'] = ["old" => $existingItem['purchase_date'], "new" => $purchaseDate];
if ($existingItem['condition'] !== $condition) $changes['Condition'] = ["old" => $existingItem['condition'], "new" => $condition];
if ($existingItem['location'] !== $location) $changes['Location'] = ["old" => $existingItem['location'], "new" => $location];
if ($existingItem['status'] !== $status) $changes['Status'] = ["old" => $existingItem['status'], "new" => $status];
if ($existingItem['remarks'] !== $remarks) $changes['Remarks'] = ["old" => $existingItem['remarks'], "new" => $remarks];
if ($existingItem['quantity'] !== $quantity) $changes['Quantity'] = ["old" => $existingItem['quantity'], "new" => $quantity];

if (empty($changes)) {
    echo json_encode([
        "message" => "No changes were made",
        "item_id" => $existingItem['id'],
        "success" => true,
        "no_changes" => true
    ]);
    exit();
}

$fieldChanged = json_encode(array_keys($changes));
$oldValues = json_encode(array_column($changes, "old"));
$newValues = json_encode(array_column($changes, "new"));
$history_stmt = $conn->prepare("
    INSERT INTO history (action, item_id, field_changed, old_value, new_value, action_date)
    VALUES ('QRCode Update', ?, ?, ?, ?, NOW())
");
$history_stmt->bind_param("ssss", $existingItem['id'], $fieldChanged, $oldValues, $newValues);
$history_stmt->execute();
$history_stmt->close();

$mobile_history_stmt = $conn->prepare("
    INSERT INTO mobile_history 
    (item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity, scanned_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
");
$mobile_history_stmt->bind_param(
    "sssssssssss", 
    $existingItem['id'], 
    $existingItem['type'], 
    $existingItem['brand'], 
    $existingItem['serial_number'], 
    $existingItem['issued_date'], 
    $existingItem['purchase_date'], 
    $existingItem['condition'],  
    $existingItem['location'], 
    $existingItem['status'],
    $existingItem['remarks'],
    $existingItem['quantity']
);
$mobile_history_stmt->execute();
$mobile_history_stmt->close();

$update_stmt = $conn->prepare("
    UPDATE inventory 
    SET id = ?, type = ?, brand = ?, serial_number = ?, issued_date = ?, purchase_date = ?, `condition` = ?, location = ?, status = ?, remarks = ?, quantity = ?
    WHERE id = ?
");

$update_stmt->bind_param("sssssssssssi", $newItemId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity, $existingItem['id']);

if (!$update_stmt->execute()) {
    error_log("Error updating inventory: " . $update_stmt->error);
    http_response_code(500);
    echo json_encode([
        "message" => "Error updating item",
        "error" => $update_stmt->error
    ]);
    exit();
}
$update_stmt->close();

if ($newItemId !== $existingItem['id']) {
    $update_history = $conn->prepare("
        UPDATE mobile_history 
        SET item_id = ? 
        WHERE item_id = ?
    ");
    $update_history->bind_param("ss", $newItemId, $existingItem['id']);
    
    if (!$update_history->execute()) {
        error_log("Error updating mobile_history: " . $update_history->error);
        error_log("Failed to update mobile_history records after inventory update");
    }
    $update_history->close();
}

echo json_encode([
    "message" => "Item updated successfully", 
    "item_id" => $newItemId,
    "success" => true
]);

$conn->close();
?> 