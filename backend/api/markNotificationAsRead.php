<?php
include('cors.php');
include('database.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Use POST."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$notification_id = $input['id'] ?? null;

if (!$notification_id) {
    echo json_encode(["success" => false, "message" => "Missing required field: notification id."]);
    exit;
}

$sql = "UPDATE notifications SET `read` = TRUE WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $notification_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Notification marked as read."]);
} else {
    error_log("Error executing query: " . $stmt->error);
    echo json_encode(["success" => false, "message" => "Failed to mark notification as read."]);
}

$stmt->close();
$conn->close();
?>
