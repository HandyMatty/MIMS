<?php
include('cors.php');
include('database.php');

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

// Assign and sanitize input
$id = intval($data['id']);
$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$serialNumber = htmlspecialchars($data['serialNumber']);
$issuedDate = !empty($data['issuedDate']) ? htmlspecialchars($data['issuedDate']) : NULL;
$purchaseDate = !empty($data['purchaseDate']) ? htmlspecialchars($data['purchaseDate']) : NULL;
$condition = htmlspecialchars($data['condition']);
$location = htmlspecialchars($data['location']);
$status = htmlspecialchars($data['status']);
$remarks = htmlspecialchars($data['remarks']);
$quantity = intval($data['quantity']);

// Check for a unique serial number (exclude current record)
if (!empty($serialNumber)) {
    $checkSerialQuery = "SELECT id FROM inventory WHERE TRIM(UPPER(serial_number)) = ? AND id != ?";
    $stmt = $conn->prepare($checkSerialQuery);
    $stmt->bind_param("si", $serialNumber, $id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        http_response_code(400);
        echo json_encode(["message" => "Serial number already exists. Please use a unique serial number."]);
        exit();
    }
    $stmt->close();
}

// Fetch the existing item details
$query = "SELECT * FROM inventory WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$existingItem = $result->fetch_assoc();
$stmt->close();

if (!$existingItem) {
    http_response_code(404);
    echo json_encode(["message" => "Item not found"]);
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

// Log changes in the history table if any exist
if (!empty($changes)) {
    $fieldChanged = json_encode(array_keys($changes)); // Changed field names
    $oldValues = json_encode(array_column($changes, "old")); // Corresponding old values
    $newValues = json_encode(array_column($changes, "new")); // Corresponding new values

    $history_stmt = $conn->prepare("
        INSERT INTO history (action, item_id, field_changed, old_value, new_value, action_date)
        VALUES ('Updated', ?, ?, ?, ?, NOW())
    ");
    $history_stmt->bind_param("isss", $id, $fieldChanged, $oldValues, $newValues);
    $history_stmt->execute();
    $history_stmt->close();
}

// Update the item in the inventory table using the determined item id
$update_stmt = $conn->prepare("
    UPDATE inventory 
    SET id = ?, type = ?, brand = ?, serial_number = ?, issued_date = ?, purchase_date = ?, `condition` = ?, location = ?, status = ?, remarks = ?, quantity = ?
    WHERE id = ?
");
$update_stmt->bind_param("ssssssssssii", $newItemId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity, $id);

if ($update_stmt->execute()) {
    echo json_encode(["message" => "Item updated successfully", "item_id" => $newItemId]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $update_stmt->error]);
}

$update_stmt->close();
$conn->close();
?>