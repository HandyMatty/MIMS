<?php
include('cors.php');  
include('database.php');
$response = array('success' => false, 'message' => 'Invalid token');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'];
    $department = $input['department'];

    if (empty($username) || empty($department)) {
        $response['message'] = 'Username and department are required';
        echo json_encode($response);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, token_expiry FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($userId, $token_expiry);
        $stmt->fetch();
        if ($token_expiry !== null && $token_expiry < time()) {
            $response['message'] = 'Token expired';
        } else {
            $stmt2 = $conn->prepare("UPDATE users SET username = ?, department = ? WHERE token = ?");
            $stmt2->bind_param("sss", $username, $department, $token);
            if ($stmt2->execute()) {
                $response['success'] = true;
                $response['message'] = 'Profile updated successfully';
            } else {
                $response['message'] = 'Failed to update profile: ' . $stmt2->error;
            }
            $stmt2->close();
        }
    } else {
        // Check if token ever existed (user logged in from another device)
        $stmt2 = $conn->prepare("SELECT id FROM users WHERE token_expiry IS NOT NULL AND token_expiry >= ?");
        $now = time();
        $stmt2->bind_param("i", $now);
        $stmt2->execute();
        $stmt2->store_result();
        if ($stmt2->num_rows > 0) {
            $response['message'] = 'Logged in from another device';
        } else {
            $response['message'] = 'User not found';
        }
        $stmt2->close();
    }
    $stmt->close();
} else {
    $response['message'] = 'Authorization token not provided';
}

$conn->close();
echo json_encode($response);
?>
