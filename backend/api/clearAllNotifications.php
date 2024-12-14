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

$sql = "DELETE FROM notifications WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "All notifications cleared."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to clear notifications."]);
}

$stmt->close();
$conn->close();
?>
