<?php
include('cors.php');  
include('database.php');

$sql = "
  SELECT 
    calendar_events.id, 
    calendar_events.event_date, 
    calendar_events.content, 
    calendar_events.event_type, 
    COALESCE(users.avatar, 'http://localhost/Sentinel-MIMS/backend/uploads/avatars/default-avatar.png') AS avatar, 
    users.username
  FROM calendar_events
  JOIN users ON calendar_events.user_id = users.id";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database query failed: ' . $conn->error]);
    exit;
}

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($events);
?>
