<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents("php://input"), true);

// Assign and sanitize input
$id = (string)$data['id']; // Keep as string since it's a date-based ID
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

// Format the purchase dates as YYYYMMDD for easy comparison
$inputPurchaseDateFormatted = date("Ymd", strtotime($purchaseDate));
$existingPurchaseDateFormatted = date("Ymd", strtotime($existingItem['purchase_date']));

// Determine whether to update the item ID
if ($inputPurchaseDateFormatted === $existingPurchaseDateFormatted) {
    // If the purchase dates are the same, retain the existing item id.
    $newItemId = $existingItem['id'];
} else {
    // Purchase date has changed; generate a new item id.
    $purchaseDateFormatted = $inputPurchaseDateFormatted;

    // Fetch the last item with an id starting with the formatted purchase date
    $query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
    $stmt = $conn->prepare($query);
    $likeParam = $purchaseDateFormatted . "%";
    $stmt->bind_param("s", $likeParam);
    $stmt->execute();
    $stmt->bind_result($lastItemId);
    $stmt->fetch();
    $stmt->close();

    if ($lastItemId) {
        // Extract last two digits (counter), increment, and format appropriately.
        $lastCounter = (int)substr($lastItemId, -2);
        $newCounter = str_pad($lastCounter + 1, 2, "0", STR_PAD_LEFT);
    } else {
        $newCounter = "01";
    }
    $newItemId = $purchaseDateFormatted . $newCounter;
}

// Prepare to log changes if any field has been updated
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

// ✅ Only log if there are real changes
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

// Proceed to update the item in the inventory table
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

// If the ID changed, update the mobile_history table to reference the new ID
if ($newItemId !== $existingItem['id']) {
    // Update the mobile_history table to reference the new ID
    $update_history = $conn->prepare("
        UPDATE mobile_history 
        SET item_id = ? 
        WHERE item_id = ?
    ");
    $update_history->bind_param("ss", $newItemId, $existingItem['id']);
    
    if (!$update_history->execute()) {
        error_log("Error updating mobile_history: " . $update_history->error);
        // Even if this fails, we've already updated the inventory, so we'll just log the error
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