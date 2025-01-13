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
$activity = $input['activity'] ?? null;
$details = $input['details'] ?? null; 

// Validate required fields
if (!$username || !$activity || !$details) {
    echo json_encode(["success" => false, "message" => "Missing required fields: username, activity, or details."]);
    exit;
}

// Insert new activity (always log a new entry)
$sql = "INSERT INTO activities (users_id, activity, details, activity_date) 
        VALUES ((SELECT id FROM users WHERE username = ?), ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $activity, $details);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Activity logged successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to log activity: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
