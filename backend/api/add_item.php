<?php
include('cors.php');
include('database.php');

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$serialNumber = htmlspecialchars($data['serialNumber']);
$date = htmlspecialchars($data['date']);
$condition = htmlspecialchars($data['condition']);
$location = htmlspecialchars($data['location']);
$status = htmlspecialchars($data['status']);

$stmt = $conn->prepare("INSERT INTO inventory (type, brand, serial_number, date, `condition`, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $type, $brand, $serialNumber, $date, $condition, $location, $status);

if ($stmt->execute()) {
    $last_id = $stmt->insert_id;
    
    // Record in history
    $history_stmt = $conn->prepare("INSERT INTO history (action, item_id, type, brand, serial_number, date, `condition`, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $history_action = 'added';
    $history_stmt->bind_param("sisssssss", $history_action, $last_id, $type, $brand, $serialNumber, $date, $condition, $location, $status);
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
