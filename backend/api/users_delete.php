<?php
include('cors.php');  
include('database.php');

$data = json_decode(file_get_contents('php://input'), true);

error_log('Received Data: ' . print_r($data, true));

if (isset($data['userIds']) && is_array($data['userIds']) && count($data['userIds']) > 0) {
    $userIds = $data['userIds'];
    $placeholders = implode(',', array_fill(0, count($userIds), '?'));

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("DELETE FROM calendar_events WHERE user_id IN ($placeholders)");
        if (!$stmt) {
            throw new Exception("Prepare failed for calendar_events: " . $conn->error);
        }

        $types = str_repeat('i', count($userIds));
        $stmt->bind_param($types, ...$userIds);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("DELETE FROM users WHERE id IN ($placeholders)");
        if (!$stmt) {
            throw new Exception("Prepare failed for users: " . $conn->error);
        }

        $stmt->bind_param($types, ...$userIds);
        $stmt->execute();
        $affectedRows = $stmt->affected_rows;
        $stmt->close();

        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => "$affectedRows user(s) deleted successfully."
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting users: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input: userIds must be a non-empty array.']);
}


$conn->close();
?>