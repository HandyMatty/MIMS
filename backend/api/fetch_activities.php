<?php
include('cors.php');  
include('database.php');

// Fetch all users and their corresponding activities
$sql = "SELECT 
            u.username AS username, 
            COALESCE(a.activity, '') AS activity, 
            COALESCE(a.details, '') AS details, 
            COALESCE(a.activity_date, '') AS date
        FROM users u
        LEFT JOIN activities a ON u.username = a.username
        ORDER BY u.username ASC";

$result = $conn->query($sql);

// Check for query errors
if (!$result) {
    die("SQL error: " . $conn->error);
}

$usersWithActivities = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $usersWithActivities[] = $row;
    }
}

echo json_encode($usersWithActivities);
$conn->close();
?>
