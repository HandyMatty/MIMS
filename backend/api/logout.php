<?php
include('cors.php');  
include('database.php');

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

$data = json_decode(file_get_contents("php://input"), true);
$rememberMe = isset($data['rememberMe']) ? $data['rememberMe'] : false;

if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];

    $stmt = $conn->prepare("SELECT id, username FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $username);
        $stmt->fetch();

        // Invalidate the user session
        $updateStmt = $conn->prepare("UPDATE users SET token = NULL, token_expiry = NULL, status = 'Inactive' WHERE id = ?");
        $updateStmt->bind_param("i", $id);
        $updateStmt->execute();
        $updateStmt->close();

        // Always remove the authentication cookie
        setcookie("authToken_$username", "", time() - 3600, "/", "", false, false);
        setcookie("authToken", "", time() - 3600, "/", "", false, false);

        echo json_encode(['success' => true, 'message' => 'Logout successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid token or already logged out']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Authorization header missing or invalid']);
}

$conn->close();

?>
