<?php
include('cors.php');
include('database.php');

$headers    = getallheaders();
$authHeader = $headers['Authorization'] ?? null;

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    echo json_encode(['success' => false, 'message' => 'Authorization header missing or invalid']);
    exit;
}

$token = $matches[1];

$stmt = $conn->prepare("SELECT id, username, token_expiry FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows !== 1) {
    echo json_encode(['success' => false, 'message' => 'Invalid token or already logged out']);
    exit;
}

$stmt->bind_result($id, $username, $token_expiry);
$stmt->fetch();
if ($token_expiry !== null && $token_expiry < time()) {
    echo json_encode(['success' => false, 'message' => 'Token expired']);
    exit;
}
$stmt->close();

$upd = $conn->prepare("
    UPDATE users
    SET token            = NULL,
        token_expiry     = NULL,
        status           = 'Inactive',
        login_attempts   = 0,
        lockout_until    = NULL
    WHERE id = ?
");
$upd->bind_param("i", $id);
$upd->execute();
$upd->close();

setcookie("authToken_{$username}", '', time() - 3600, '/', '', true, false);

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
$conn->close();
