<?php
include('cors.php');  
include('database.php');

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

echo json_encode($response);
?>
