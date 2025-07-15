<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid token');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    $input = json_decode(file_get_contents('php://input'), true);
    $currentPassword = $input['currentPassword'];
    $newPassword = $input['newPassword'];

    if (empty($currentPassword) || empty($newPassword)) {
        $response['message'] = 'Current password and new password are required';
        echo json_encode($response);
        exit;
    }

    $stmt = $conn->prepare("SELECT password, token_expiry FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($dbPassword, $token_expiry);
        $stmt->fetch();
        if ($token_expiry !== null && $token_expiry < time()) {
            $response['message'] = 'Token expired';
        } else {
            if (password_verify($currentPassword, $dbPassword)) {
                if (password_verify($newPassword, $dbPassword)) {
                    $response['message'] = 'New password cannot be the same as the current password';
                } else {
                    $hashedNewPassword = password_hash($newPassword, PASSWORD_BCRYPT);

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
