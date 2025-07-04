<?php
include('cors.php');
include('database.php');

$query = "
    SELECT id, action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, 
           field_changed, old_value, new_value, action_date, quantity
    FROM history
    ORDER BY id DESC
";

$result = $conn->query($query);

$history = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['field_changed'] = json_decode($row['field_changed'], true) ?: [];
        $row['old_value'] = json_decode($row['old_value'], true) ?: [];
        $row['new_value'] = json_decode($row['new_value'], true) ?: [];
        $history[] = $row;
    }
    echo json_encode($history);
} else {
    http_response_code(200);
    echo json_encode([]);
}

$conn->close();
?>
