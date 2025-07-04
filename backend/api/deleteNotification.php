<?php
include('cors.php');
include('database.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Use POST."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$notificationId = $input['id'] ?? null;

if (!$notificationId) {
    echo json_encode(["success" => false, "message" => "Missing required field: id."]);
    exit;
}

$sql = "DELETE FROM notifications WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $notificationId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Notification deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete notification: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
