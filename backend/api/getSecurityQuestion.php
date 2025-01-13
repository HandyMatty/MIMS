<?php
include('cors.php');
include('database.php');

// Check if the token is provided in the headers
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authorization token is missing']);
    exit();
}

// Extract token from the Authorization header
$authHeader = $headers['Authorization'];
$token = str_replace('Bearer ', '', $authHeader);

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch user details using the token
    $stmt = $conn->prepare("SELECT username, security_question, security_answer FROM users WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->bind_result($username, $security_question, $security_answer);

    if ($stmt->fetch()) {
        echo json_encode([
            'success' => true,
            'username' => $username,
            'security_question' => $security_question,
            'security_answer' => $security_answer,
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found or invalid token']);
    }

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read the input data
    $data = json_decode(file_get_contents('php://input'), true);
    $security_question = $data['security_question'] ?? null;
    $security_answer = $data['security_answer'] ?? null;

    if (empty($security_question) || empty($security_answer)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Both security question and answer are required']);
        exit();
    }
// Hash the security answer before saving it
$hashed_answer = password_hash($security_answer, PASSWORD_BCRYPT);

// Update security question and hashed answer in the database
$stmt = $conn->prepare("UPDATE users SET security_question = ?, security_answer = ? WHERE token = ?");
$stmt->bind_param("sss", $security_question, $hashed_answer, $token);


    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Security question and answer updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update security question and answer']);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
?>
