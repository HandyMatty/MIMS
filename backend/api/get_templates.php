<?php
include('cors.php');
include('database.php');

// Get all templates
$query = "SELECT * FROM saved_templates ORDER BY created_at DESC";
$result = $conn->query($query);

if ($result) {
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = [
            'id' => $row['id'],
            'template_name' => $row['template_name'],
            'type' => $row['type'],
            'brand' => $row['brand'],
            'condition' => $row['condition'],
            'status' => $row['status'],
            'quantity' => $row['quantity'],
            'location' => $row['location'],
            'remarks' => $row['remarks'],
            'created_at' => $row['created_at'],
            'created_by' => $row['created_by'],
            'serialNumber' => $row['serial_number'],
            'purchaseDate' => $row['purchase_date'],
            'issuedDate' => $row['issued_date']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "templates" => $templates
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $conn->error]);
}

$conn->close();
?> 