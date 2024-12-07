<?php
include('cors.php');  
include('database.php');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['username'], $data['department'], $data['role'], $data['password'], $data['security_question'], $data['security_answer'])) {
    $username = $data['username'];
    $department = $data['department'];
    $role = $data['role'];
    $password = $data['password'];
    $security_question = $data['security_question'];
    $security_answer = $data['security_answer'];

    // Hash the password and security answer
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $hashedAnswer = password_hash($security_answer, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, department, role, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $username, $department, $role, $hashedPassword, $security_question, $hashedAnswer);

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
