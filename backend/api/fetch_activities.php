<?php
include('cors.php');  
include('database.php');

// Fetch all activities with corresponding usernames
$sql = "SELECT 
            a.id AS id, 
            u.username AS username, 
            a.activity AS activity, 
            a.details AS details, 
            a.activity_date AS date
        FROM activities a
        INNER JOIN users u ON a.users_id = u.id
        ORDER BY a.activity_date DESC";

$result = $conn->query($sql);

// Process results
$activities = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $activities[] = $row;
    }
}

echo json_encode($activities);
$conn->close();
?>
