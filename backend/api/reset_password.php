<?php
include('cors.php');  
include('database.php');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['userId'], $data['password'])) {
    $userId = $data['userId'];
    $newPassword = $data['password'];

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashedPassword, $userId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to reset password.']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
}

$conn->close();
?>
