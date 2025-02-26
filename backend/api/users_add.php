<?php
include('cors.php');  
include('database.php');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['username'], $data['department'], $data['role'], $data['password'])) {
    $username = $data['username'];
    $department = $data['department'];
    $role = $data['role'];
    $password = $data['password'];

    // Check if the username already exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM users WHERE username = ?");
    $checkStmt->bind_param("s", $username);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();
    if ($count > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // If role is 'guest', set security_question & security_answer as NULL
    if ($role === 'guest') {
        $security_question = null;
        $security_answer = null;
    } else {
        if (!isset($data['security_question'], $data['security_answer'])) {
            echo json_encode(['success' => false, 'message' => 'Security question and answer are required for non-guest users.']);
            exit;
        }
        $security_question = $data['security_question'];
        $security_answer = password_hash($data['security_answer'], PASSWORD_DEFAULT);
    }

    $stmt = $conn->prepare("INSERT INTO users (username, department, role, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $username, $department, $role, $hashedPassword, $security_question, $security_answer);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User added successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add user.']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
}

$conn->close();
?>
