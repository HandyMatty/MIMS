<?php
include('cors.php');  
include('database.php');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Use POST."]);
    exit;
}

// Get the JSON payload
$input = json_decode(file_get_contents("php://input"), true);

$username = $input['username'] ?? null;
$message = $input['message'] ?? null;
$details = $input['details'] ?? null; 

// Validate required fields
if (!$username || !$message || !$details) {
    echo json_encode(["success" => false, "message" => "Missing required fields: username, message, or details."]);
    exit;
}

// Insert notification into the database
$sql = "INSERT INTO notifications (username, message, details, notification_date, `read`) VALUES (?, ?, ?, NOW(), FALSE)";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("sss", $username, $message, $details);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Notification logged successfully."]);
    } else {
        error_log("SQL Execution Error: " . $stmt->error);  // Log the error
        echo json_encode(["success" => false, "message" => "Failed to log notification: " . $stmt->error]);
    }

    $stmt->close();
} else {
    error_log("SQL Preparation Error: " . $conn->error);  // Log the preparation error
    echo json_encode(["success" => false, "message" => "Failed to prepare SQL statement: " . $conn->error]);
}

$conn->close();
?>
