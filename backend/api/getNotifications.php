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

// Validate username
if (!$username) {
    echo json_encode(["success" => false, "message" => "Missing required field: username."]);
    exit;
}

// Fetch notifications for the user
$sql = "SELECT id, username, message, details, notification_date, `read` FROM notifications WHERE username = ? ORDER BY notification_date DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $notifications = [];

    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;  // Add each notification to the array
    }

    echo json_encode(["success" => true, "notifications" => $notifications]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to fetch notifications: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
