<?php
include('cors.php');
include('database.php');

$result = $conn->query("SELECT * FROM mobile_history ORDER BY scanned_at DESC");

$history = [];
while ($row = $result->fetch_assoc()) {
    $history[] = $row;
}

echo json_encode($history);

$conn->close();
?>
