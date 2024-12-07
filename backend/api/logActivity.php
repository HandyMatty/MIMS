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

// Check if the user already has an existing activity
$sql = "SELECT * FROM activities WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User already has an activity, so update the existing one
    $sql = "UPDATE activities SET activity = ?, details = ?, activity_date = NOW() WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $activity, $details, $username);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Activity updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update activity: " . $stmt->error]);
    }
} else {
    // User does not have an activity, so insert a new one
    $sql = "INSERT INTO activities (username, activity, details, activity_date) VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $username, $activity, $details);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Activity logged successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to log activity: " . $stmt->error]);
    }
}

$stmt->close();
$conn->close();
?>
