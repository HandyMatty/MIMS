<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid token');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    // Updated SQL query to return a default avatar if none is set
    $stmt = $conn->prepare("
        SELECT username, department, 
        COALESCE(avatar, 'http://localhost/Sentinel-MIMS/backend/uploads/avatars/default-avatar.png') AS avatar 
        FROM users 
        WHERE token = ?
    ");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($username, $department, $avatar);
        $stmt->fetch();

        $response = array(
            'success' => true,
            'username' => $username,
            'department' => $department,
            'avatar' => $avatar 
        );
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
