<?php
include('cors.php');
include('database.php');

// Fetch history data with item details
$query = "
    SELECT 
        h.id, h.action, h.item_id, h.field_changed, h.old_value, h.new_value, h.action_date,
        i.type, i.brand, i.serial_number, i.issued_date, i.purchase_date, i.condition, i.location, i.status, i.remarks
    FROM history h
    LEFT JOIN inventory i ON h.item_id = i.id
    ORDER BY h.id DESC
";

$result = $conn->query($query);

$history = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Decode JSON values for display
        $row['field_changed'] = json_decode($row['field_changed'], true);
        $row['old_value'] = json_decode($row['old_value'], true);
        $row['new_value'] = json_decode($row['new_value'], true);
        $history[] = $row;
    }
    echo json_encode($history);
} else {
    http_response_code(200);
    echo json_encode([]);
}

$conn->close();
?>
