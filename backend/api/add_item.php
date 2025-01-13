<?php
include('cors.php');
include('database.php');

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$serialNumber = htmlspecialchars($data['serialNumber']);
$issuedDate = htmlspecialchars($data['issuedDate']); 
$purchaseDate = htmlspecialchars($data['purchaseDate']); 
$condition = htmlspecialchars($data['condition']);
$location = htmlspecialchars($data['location']);
$status = htmlspecialchars($data['status']);

// Insert into the inventory table with the new issued_date column
$stmt = $conn->prepare("INSERT INTO inventory (type, brand, serial_number, issued_date, purchase_date, `condition`, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status);

if ($stmt->execute()) {
    $last_id = $stmt->insert_id;

    // Record in the history table with the renamed issued_date column
    $history_stmt = $conn->prepare("INSERT INTO history (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $history_action = 'added';
    $history_stmt->bind_param("sissssssss", $history_action, $last_id, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status);
    $history_stmt->execute();

    http_response_code(201); // Set HTTP response status
    echo json_encode(["message" => "Item added successfully", "id" => $last_id]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
