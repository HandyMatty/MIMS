<?php
include('cors.php');  
include('database.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['userId'])) {
    $userId = intval($_GET['userId']);

    if (empty($userId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required.']);
        exit();
    }

    $stmt = $conn->prepare("SELECT security_question FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($security_question);

    if ($stmt->fetch()) {
        echo json_encode(['success' => true, 'security_question' => $security_question]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }

    $stmt->close();
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    $userId = intval($input['userId'] ?? null);
    $security_question = $input['security_question'] ?? '';
    $security_answer = $input['security_answer'] ?? '';

    if (empty($userId) || empty($security_question) || empty($security_answer)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit();
    }

    $hashed_answer = password_hash($security_answer, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE users SET security_question = ?, security_answer = ? WHERE id = ?");
    $stmt->bind_param("ssi", $security_question, $hashed_answer, $userId);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Security question updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update or no changes made.']);
    }

    $stmt->close();
}

$conn->close();
?>
