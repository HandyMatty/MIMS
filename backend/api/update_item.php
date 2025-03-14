<?php
include('cors.php');
include('database.php');

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

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

// Fetch existing item details before update
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

// Store changes in an array
$changes = [];
if ($existingItem['type'] !== $type) $changes['Type'] = ["old" => $existingItem['type'], "new" => $type];
if ($existingItem['brand'] !== $brand) $changes['Brand'] = ["old" => $existingItem['brand'], "new" => $brand];
if ($existingItem['serial_number'] !== $serialNumber) $changes['Serial Number'] = ["old" => $existingItem['serial_number'], "new" => $serialNumber];
if ($existingItem['issued_date'] !== $issuedDate) $changes['Issued Date'] = ["old" => $existingItem['issued_date'], "new" => $issuedDate];
if ($existingItem['purchase_date'] !== $purchaseDate) $changes['Purchase Date'] = ["old" => $existingItem['purchase_date'], "new" => $purchaseDate];
if ($existingItem['condition'] !== $condition) $changes['Condition'] = ["old" => $existingItem['condition'], "new" => $condition];
if ($existingItem['location'] !== $location) $changes['Location'] = ["old" => $existingItem['location'], "new" => $location];
if ($existingItem['status'] !== $status) $changes['Status'] = ["old" => $existingItem['status'], "new" => $status];
if ($existingItem['remarks'] !== $remarks) $changes['Remarks'] = ["old" => $existingItem['remarks'], "new" => $remarks];

// If changes exist, insert them into the history table as a JSON object
if (!empty($changes)) {
    $fieldChanged = json_encode(array_keys($changes)); // Store changed field names
    $oldValues = json_encode(array_column($changes, "old")); // Store old values
    $newValues = json_encode(array_column($changes, "new")); // Store new values

    $history_stmt = $conn->prepare("
        INSERT INTO history (action, item_id, field_changed, old_value, new_value, action_date) 
        VALUES ('Updated', ?, ?, ?, ?, NOW())
    ");
    $history_stmt->bind_param("isss", $id, $fieldChanged, $oldValues, $newValues);
    $history_stmt->execute();
    $history_stmt->close();
}

// Update the item details
$update_stmt = $conn->prepare("
    UPDATE inventory 
    SET type = ?, brand = ?, serial_number = ?, issued_date = ?, purchase_date = ?, `condition` = ?, location = ?, status = ?, remarks = ? 
    WHERE id = ?
");
$update_stmt->bind_param("sssssssssi", $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $id);

if ($update_stmt->execute()) {
    echo json_encode(["message" => "Item updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $update_stmt->error]);
}

$update_stmt->close();
$conn->close();
?>
