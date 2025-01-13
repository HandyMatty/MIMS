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

    // Validate token with user
    $stmt = $conn->prepare("SELECT id FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Token is valid, proceed to update
        $stmt = $conn->prepare("UPDATE users SET username = ?, department = ? WHERE token = ?");
        $stmt->bind_param("sss", $username, $department, $token);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Profile updated successfully';
        } else {
            $response['message'] = 'Failed to update profile: ' . $stmt->error; // Log specific error
        }
    } else {
        $response['message'] = 'Invalid token. Could not find the user associated with this token.';
    }

    $stmt->close();
} else {
    $response['message'] = 'Authorization token not provided';
}

$conn->close();
echo json_encode($response);
?>
