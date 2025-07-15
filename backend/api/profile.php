<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid token');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    $stmt = $conn->prepare("SELECT username, department, COALESCE(avatar, 'http://localhost/Sentinel-MIMS/backend/uploads/avatars/default-avatar.png') AS avatar, token_expiry FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($username, $department, $avatar, $token_expiry);
        $stmt->fetch();
        if ($token_expiry !== null && $token_expiry < time()) {
            $response['message'] = 'Token expired';
        } else {
            $response = array(
                'success' => true,
                'username' => $username,
                'department' => $department,
                'avatar' => $avatar 
            );
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
