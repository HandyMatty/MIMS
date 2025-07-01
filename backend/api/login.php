<?php
include('cors.php');
include('database.php');

// Configuration
$max_attempts  = 5;
$lockout_time  = 900; // 15 minutes in seconds

$response = ['success' => false, 'message' => 'Invalid credentials'];
$data     = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing username or password']);
    exit;
}

$username   = $data['username'];
$password   = $data['password'];
$rememberMe = !empty($data['rememberMe']);

$current_time = time();

// Fetch user and lockout info in one query
$stmt = $conn->prepare("
  SELECT id, password, role, status, token_expiry,
         login_attempts, lockout_until
  FROM users
  WHERE BINARY username = ?
");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows !== 1) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$stmt->bind_result(
    $id, $hashed_password, $role, $status, $token_expiry,
    $login_attempts, $lockout_until
);
$stmt->fetch();
$stmt->close();

// Check if account is locked
if ($lockout_until !== null && strtotime($lockout_until) > $current_time) {
    $remaining = strtotime($lockout_until) - $current_time;
    echo json_encode([
        'success' => false,
        'message' => "Account locked. Try again in " . ceil($remaining / 60) . " minutes."
    ]);
    exit;
}


// Verify password
if (!password_verify($password, $hashed_password)) {
    // Increment login_attempts
    $login_attempts++;
    $new_lockout = null;
    if ($login_attempts >= $max_attempts) {
        $new_lockout = date('Y-m-d H:i:s', $current_time + $lockout_time);
    }
    $upd = $conn->prepare("
      UPDATE users
      SET login_attempts = ?, lockout_until = ?
      WHERE id = ?
    ");
    $upd->bind_param("isi", $login_attempts, $new_lockout, $id);
    $upd->execute();
    $attempts_left = max(0, $max_attempts - $login_attempts);
    $message = 'Incorrect password.';
    if ($attempts_left > 0) {
        $message .= " You have $attempts_left attempt" . ($attempts_left > 1 ? 's' : '') . " remaining.";
    } else {
        $message .= " Your account is now locked for " . ($lockout_time / 60) . " minutes.";
    }
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// Successful login: reset attempts and lockout
$upd = $conn->prepare("
  UPDATE users
  SET login_attempts = 0,
      lockout_until = NULL,
      token = ?,
      token_expiry = ?,
      status = 'Active',
      last_login = NOW()
  WHERE id = ?
");
$token = bin2hex(random_bytes(32));
$expiry = $current_time + ($rememberMe ? 7*24*3600 : 24*3600);
$upd->bind_param("sii", $token, $expiry, $id);
$upd->execute();

// Set secure cookie
setcookie("authToken_$username", $token, [
    'expires'  => $expiry,
    'path'     => '/',
    'secure'   => true,
    'httponly' => false,
    'samesite' => 'Lax'
]);

echo json_encode([
    'success'    => true,
    'token'      => $token,
    'role'       => $role,
    'expires_in' => $expiry
]);
$conn->close();
