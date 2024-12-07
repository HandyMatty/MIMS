<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid request');
$data = json_decode(file_get_contents('php://input'), true);

// Handle fetching security question
if (isset($data['username']) && !isset($data['security_answer']) && !isset($data['newPassword'])) {
    $username = $data['username'];

    $stmt = $conn->prepare("SELECT security_question FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($security_question);
        $stmt->fetch();
        if (!empty($security_question)) {
            $response = array('success' => true, 'security_question' => $security_question);
        } else {
            $response = array('success' => false, 'message' => 'User has no security question set. Please ask the admin.');
        }
    } else {
        $response['message'] = 'User not found.';
    }

    $stmt->close();
}

// Handle validating security answer and updating password
else if (isset($data['username'], $data['security_answer'], $data['newPassword'])) {
    $username = $data['username'];
    $security_answer = $data['security_answer'];
    $newPassword = $data['newPassword'];

    $stmt = $conn->prepare("SELECT security_answer FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($storedAnswer);
        $stmt->fetch();

        // Verify the security answer
        if (password_verify($security_answer, $storedAnswer)) {
            $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Update the user's password
            $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
            $updateStmt->bind_param("ss", $hashedNewPassword, $username);
            if ($updateStmt->execute()) {
                $response = array('success' => true, 'message' => 'Password updated successfully.');
            } else {
                $response['message'] = 'Failed to update the password.';
            }
            $updateStmt->close();
        } else {
            $response['message'] = 'Security answer is incorrect.';
        }
    } else {
        $response['message'] = 'User not found.';
    }

    $stmt->close();
} else {
    $response['message'] = 'Invalid input.';
}

$conn->close();
echo json_encode($response);
?>
