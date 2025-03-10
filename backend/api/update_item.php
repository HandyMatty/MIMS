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

// Format purchase date for ID generation (YYYYMMDD)
$purchaseDateFormatted = date("Ymd", strtotime($purchaseDate));

// Fetch the last item with the same purchase date
$query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
$stmt = $conn->prepare($query);
$likeParam = $purchaseDateFormatted . "%";
$stmt->bind_param("s", $likeParam);
$stmt->execute();
$stmt->bind_result($lastId);
$stmt->fetch();
$stmt->close();

// Generate new ID
if ($lastId) {
    $lastCounter = (int)substr($lastId, -2); // Extract last two digits
    $newCounter = str_pad($lastCounter + 1, 2, "0", STR_PAD_LEFT);
} else {
    $newCounter = "01"; // Start with 01 if no previous item exists
}
$newId = $purchaseDateFormatted . $newCounter;

// Step 1: Insert update action into history
$history_stmt = $conn->prepare("
    INSERT INTO history (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
$history_action = 'Updated';
$history_stmt->bind_param("sisssssssss", 
    $history_action, 
    $id, 
    $type, 
    $brand, 
    $serialNumber, 
    $issuedDate, 
    $purchaseDate, 
    $condition, 
    $location, 
    $status, 
    $remarks
);
$history_stmt->execute();
$history_stmt->close();

// Step 2: Update the item details and change ID based on purchase date
$stmt = $conn->prepare("
    UPDATE inventory 
    SET id = ?, type = ?, brand = ?, serial_number = ?, issued_date = ?, purchase_date = ?, `condition` = ?, location = ?, status = ?, remarks = ? 
    WHERE id = ?
");
$stmt->bind_param("ssssssssssi", $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Item updated successfully", "new_id" => $newId]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
