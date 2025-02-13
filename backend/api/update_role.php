<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents('php://input'), true);

// Adjust to check for 'userId' and 'role'
if (isset($data['userId'], $data['role'])) {
    $userId = $data['userId'];
    $role = $data['role'];

    // Now use userId in the SQL query, assuming 'id' is the primary key
    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->bind_param("si", $role, $userId);  // Assuming id is an integer

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
