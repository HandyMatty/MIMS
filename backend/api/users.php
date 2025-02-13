<?php
include('cors.php');  
include('database.php');

// Fetch all users including status and latest activity
$stmt = $conn->prepare("SELECT id, username, role, department, status FROM users");
$stmt->execute();
$stmt->bind_result($id, $username, $role, $department, $status);

$users = array();
while ($stmt->fetch()) {
    $users[] = array(
        'id' => $id,
        'username' => $username,
        'role' => $role,
        'department' => $department,
        'status' => $status 
    );
}

$stmt->close();
$conn->close();

$response = array(
    'success' => true,
    'users' => $users
);

// Return the response as JSON
echo json_encode($response);
?>
