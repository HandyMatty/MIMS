<?php
include('cors.php');
include('database.php');

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data['id']); 
$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$serialNumber = htmlspecialchars($data['serialNumber']);
$issuedDate = htmlspecialchars($data['issuedDate']); 
$purchaseDate = htmlspecialchars($data['purchaseDate']); 
$condition = htmlspecialchars($data['condition']);
$location = htmlspecialchars($data['location']);
$status = htmlspecialchars($data['status']);

/// Record in history before updating
$history_stmt = $conn->prepare("
INSERT INTO history 
(action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$history_action = 'Updated';
$issuedDate = !empty($issuedDate) ? $issuedDate : NULL;
$purchaseDate = !empty($purchaseDate) ? $purchaseDate : NULL;

$history_stmt->bind_param(
"sissssssss", 
$history_action, 
$id, 
$type, 
$brand, 
$serialNumber, 
$issuedDate, 
$purchaseDate, 
$condition, 
$location, 
$status
);

$history_stmt->execute();

// Now update the inventory item
$stmt = $conn->prepare("UPDATE inventory SET type = ?, brand = ?, serial_number = ?, issued_date = ?, purchase_date = ?, `condition` = ?, location = ?, status = ? WHERE id = ?");
$stmt->bind_param("ssssssssi", $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Item updated successfully"]);
} else {
    http_response_code(500); 
    echo json_encode(["message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
