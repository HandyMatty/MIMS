<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid token');

// Get Authorization header
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    // Parse the input data (JSON)
    $input = json_decode(file_get_contents('php://input'), true);
    $currentPassword = $input['currentPassword'];
    $newPassword = $input['newPassword'];

    // Validate input
    if (empty($currentPassword) || empty($newPassword)) {
        $response['message'] = 'Current password and new password are required';
        echo json_encode($response);
        exit;
    }

    // Fetch the user's current password from the database
    $stmt = $conn->prepare("SELECT password FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($dbPassword);
        $stmt->fetch();

        // Verify the current password
        if (password_verify($currentPassword, $dbPassword)) {
            // Check if the new password is the same as the current password
            if (password_verify($newPassword, $dbPassword)) {
                $response['message'] = 'New password cannot be the same as the current password';
            } else {
                // Hash the new password
                $hashedNewPassword = password_hash($newPassword, PASSWORD_BCRYPT);

                // Update the password in the database
                $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE token = ?");
                $updateStmt->bind_param("ss", $hashedNewPassword, $token);

                if ($updateStmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Password updated successfully';
                } else {
                    $response['message'] = 'Failed to update password';
                }
                $updateStmt->close();
            }
        } else {
            $response['message'] = 'Current password is incorrect';
        }
    } else {
        $response['message'] = 'User not found';
    }

    $stmt->close();
} else {
    $response['message'] = 'Authorization token not provided';
}

$conn->close();
echo json_encode($response);
?>
