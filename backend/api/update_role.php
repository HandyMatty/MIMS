<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['userId'], $data['role'])) {
    $userId = $data['userId'];
    $role = $data['role'];

    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->bind_param("si", $role, $userId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Role updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update role.']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
}

$conn->close();
?>
