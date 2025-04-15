<?php
include('cors.php');  
include('database.php');

$response = array('success' => false, 'message' => 'Invalid credentials');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['username']) && isset($data['password'])) {
    $username = $data['username'];
    $password = $data['password'];
    $rememberMe = isset($data['rememberMe']) ? $data['rememberMe'] : false;

    $stmt = $conn->prepare("SELECT id, password, role, status, token_expiry FROM users WHERE BINARY username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $hashed_password, $role, $status, $token_expiry);
        $stmt->fetch();

        $current_time = time();
        $expiry_duration = $rememberMe ? (7 * 24 * 60 * 60) : (24 * 60 * 60); // 7 days or 1 day
        $new_expiry_time = $current_time + $expiry_duration;

        if ($status === 'Active' && $token_expiry > $current_time) {
            $response['message'] = 'User already logged in on another device.';
        } else {
            if (password_verify($password, $hashed_password)) {
                $token = bin2hex(random_bytes(16));

                // Update the token and expiry in DB
                $updateStmt = $conn->prepare("UPDATE users SET token = ?, token_expiry = ?, status = 'Active' WHERE id = ?");
                $updateStmt->bind_param("sii", $token, $new_expiry_time, $id);
                $updateStmt->execute();
                $updateStmt->close();

                // Set cookie with the same expiry
                setcookie("authToken_$username", $token, $new_expiry_time, "/", "", false, false);

                $response = array(
                    'success' => true,
                    'token' => $token,
                    'role' => $role,
                    'expires_in' => $new_expiry_time
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
