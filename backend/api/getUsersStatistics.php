<?php
include('cors.php');  
include('database.php');

$response = [];

$totalUsersQuery = "SELECT COUNT(*) AS total_users FROM users";
$totalUsersResult = $conn->query($totalUsersQuery);

if ($totalUsersResult->num_rows > 0) {
  $totalUsers = $totalUsersResult->fetch_assoc();
  $response['totalUsers'] = $totalUsers['total_users'];
} else {
  $response['totalUsers'] = 0;
}

$activeUsersQuery = "SELECT COUNT(*) AS active_users FROM users WHERE status = 'active'";
$activeUsersResult = $conn->query($activeUsersQuery);

if ($activeUsersResult->num_rows > 0) {
  $activeUsers = $activeUsersResult->fetch_assoc();
  $response['activeUsers'] = $activeUsers['active_users'];
} else {
  $response['activeUsers'] = 0;
}

$activitiesQuery = "SELECT COUNT(*) AS total_activities FROM activities"; 
$activitiesResult = $conn->query($activitiesQuery);

if ($activitiesResult->num_rows > 0) {
  $activities = $activitiesResult->fetch_assoc();
  $response['activities'] = $activities['total_activities'];
} else {
  $response['activities'] = 0;
}

$conn->close();

echo json_encode($response);
?>
