<?php
include('cors.php');  
include('database.php');

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];

    // Check if the token exists and is active
    $stmt = $conn->prepare("SELECT id, status FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $status);
        $stmt->fetch();

        if ($status === 'Inactive') {
            echo json_encode(['success' => false, 'message' => 'Token already inactive']);
        } else {
            // Invalidate the token and update the status
            $updateStmt = $conn->prepare("UPDATE users SET token = NULL, status = 'Inactive' WHERE id = ?");
            $updateStmt->bind_param("i", $id);
            $updateStmt->execute();
            $updateStmt->close();

            echo json_encode(['success' => true, 'message' => 'Logout successful']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid token or already logged out']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Authorization header missing or invalid']);
}

$conn->close();
?>
