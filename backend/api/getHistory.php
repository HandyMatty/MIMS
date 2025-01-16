<?php
include('cors.php');
include('database.php');

// Get the data from history table
$query = "SELECT * FROM history ORDER BY id DESC"; 
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $history = array();
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    echo json_encode($history);
} else {
    http_response_code(200); 
    echo json_encode([]);    
}

$conn->close();
?>
