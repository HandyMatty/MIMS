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
    $username = $input['username'];
    $department = $input['department'];

    // Validate input
    if (empty($username) || empty($department)) {
        $response['message'] = 'Username and department are required';
        echo json_encode($response);
        exit;
    }

    // Prepare SQL statement to update user details based on the token
    $stmt = $conn->prepare("UPDATE users SET username = ?, department = ? WHERE token = ?");
    $stmt->bind_param("sss", $username, $department, $token);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Profile updated successfully';
    } else {
        $response['message'] = 'Failed to update profile';
    }

    $stmt->close();
} else {
    $response['message'] = 'Authorization token not provided';
}

$conn->close();
echo json_encode($response);
?>
