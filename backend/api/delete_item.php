<?php
include('cors.php');
include('database.php');

// Get the POST data (item IDs)
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['ids'])) {
    $ids = $data['ids'];

    // Record history for each deleted item
    foreach ($ids as $id) {
        // Get item details
        $stmt = $conn->prepare("SELECT * FROM inventory WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $item = $result->fetch_assoc();

       // Record history for deleted items
if ($item) {
    $history_stmt = $conn->prepare("
        INSERT INTO history 
        (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $history_action = 'Deleted';
    $issuedDate = !empty($item['issued_date']) ? $item['issued_date'] : NULL;
    $purchaseDate = !empty($item['purchase_date']) ? $item['purchase_date'] : NULL;

    $history_stmt->bind_param(
        "sissssssss", 
        $history_action, 
        $id, 
        $item['type'], 
        $item['brand'], 
        $item['serial_number'], 
        $issuedDate, 
        $purchaseDate, 
        $item['condition'], 
        $item['location'], 
        $item['status']
    );

    $history_stmt->execute();
}

    }

    // Delete items
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $conn->prepare("DELETE FROM inventory WHERE id IN ($placeholders)");
    $types = str_repeat('i', count($ids));
    $stmt->bind_param($types, ...$ids);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Items deleted successfully"]);
    } else {
        echo json_encode(["message" => "Error: " . $stmt->error]);
    }
}
$conn->close();
?>
