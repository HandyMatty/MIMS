<?php
include('cors.php');  
include('database.php'); 

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

$stmt = $conn->prepare("SELECT id, avatar, username FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($userId, $avatar, $username);
    $stmt->fetch();

    $data = json_decode(file_get_contents("php://input"), true);
    $event_date = $data['date'];
    $content = $data['content'];
    $event_type = $data['event_type'];

    $stmtInsert = $conn->prepare("INSERT INTO calendar_events (event_date, content, event_type, user_id) VALUES (?, ?, ?, ?)");
    $stmtInsert->bind_param("sssi", $event_date, $content, $event_type, $userId);

    if ($stmtInsert->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Event added successfully', 
            'id' => $stmtInsert->insert_id,  
            'avatar' => $avatar,           
            'username' => $username         
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add event']);
    }

    $stmtInsert->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
}

$stmt->close();
$conn->close();
?>
