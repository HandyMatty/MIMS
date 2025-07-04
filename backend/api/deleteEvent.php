<?php
include('cors.php');  
include('database.php');

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

$stmt = $conn->prepare("SELECT id, role FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($userId, $role);
    $stmt->fetch();

    $data = json_decode(file_get_contents("php://input"), true);
    $eventId = $data['id'];

    $eventCheckStmt = $conn->prepare("SELECT user_id FROM calendar_events WHERE id = ?");
    $eventCheckStmt->bind_param("i", $eventId);
    $eventCheckStmt->execute();
    $eventCheckStmt->store_result();

    if ($eventCheckStmt->num_rows === 1) {
        $eventCheckStmt->bind_result($eventOwnerId);
        $eventCheckStmt->fetch();

        if ($role === 'admin' || $eventOwnerId === $userId) {
            $stmtDelete = $conn->prepare("DELETE FROM calendar_events WHERE id = ?");
            $stmtDelete->bind_param("i", $eventId);
            
            if ($stmtDelete->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete event']);
            }
            $stmtDelete->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Unauthorized to delete this event']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Event not found']);
    }

    $eventCheckStmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
}

$stmt->close();
$conn->close();

?>
