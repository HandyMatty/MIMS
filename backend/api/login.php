<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid credentials');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['username']) && isset($data['password'])) {
    $username = $data['username'];
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT id, password, role, status FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $hashed_password, $role, $status);
        $stmt->fetch();

        if ($status === 'Active') {
            $response['message'] = 'User already logged in on another device.';
        } else {
            if (password_verify($password, $hashed_password)) {
                $token = bin2hex(random_bytes(16));
                
                // Update the token and set status as 'Active'
                $updateStmt = $conn->prepare("UPDATE users SET token = ?, status = 'Active' WHERE id = ?");
                $updateStmt->bind_param("si", $token, $id);
                $updateStmt->execute();
                $updateStmt->close();

                $response = array(
                    'success' => true,
                    'token' => $token,
                    'role' => $role
                );
            } else {
                $response['message'] = 'Incorrect password';
            }
        }
    } else {
        $response['message'] = 'User not found';
    }

    $stmt->close();
} else {
    $response['message'] = 'Missing username or password';
}

$conn->close();
echo json_encode($response);
?>
