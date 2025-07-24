<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$sql = "SELECT pr.id as request_id, pr.requester_id, pr.department, pr.request_date, pr.status as request_status, pr.remarks as request_remarks, 
              pi.id as item_id, pi.type, pi.brand, pi.serial_number, pi.issued_date, pi.purchase_date, pi.condition, pi.location, pi.status as item_status, pi.remarks as item_remarks, pi.quantity
        FROM procurement_requests pr
        LEFT JOIN procurement_items pi ON pr.id = pi.request_id
        ORDER BY pr.request_date DESC, pr.id DESC, pi.id ASC";

$result = $conn->query($sql);

$requests = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $rid = $row['request_id'];
        if (!isset($requests[$rid])) {
            $requests[$rid] = [
                'request_id' => $row['request_id'],
                'requester_id' => $row['requester_id'],
                'department' => $row['department'],
                'request_date' => $row['request_date'],
                'status' => $row['request_status'],
                'remarks' => $row['request_remarks'],
                'items' => []
            ];
        }
        if ($row['item_id']) {
            $requests[$rid]['items'][] = [
                'item_id' => $row['item_id'],
                'type' => $row['type'],
                'brand' => $row['brand'],
                'serial_number' => $row['serial_number'],
                'issued_date' => $row['issued_date'],
                'purchase_date' => $row['purchase_date'],
                'condition' => $row['condition'],
                'location' => $row['location'],
                'status' => $row['item_status'],
                'remarks' => $row['item_remarks'],
                'quantity' => $row['quantity']
            ];
        }
    }
}

// Re-index as array
$requests = array_values($requests);
echo json_encode(['success' => true, 'requests' => $requests]);
$conn->close(); 