<?php
include('cors.php');
include('database.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Use POST."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$username = $input['username'] ?? null;

if (!$username) {
    echo json_encode(["success" => false, "message" => "Missing required field: username."]);
    exit;
}

$sql = "UPDATE notifications SET `read` = TRUE WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "All notifications marked as read."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to mark all notifications as read."]);
}

$stmt->close();
$conn->close();
?>
