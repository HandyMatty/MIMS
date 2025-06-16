<?php
include('cors.php');
include('database.php');

// Get the POST data (item IDs)
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['ids'])) {
    $ids = $data['ids'];

    foreach ($ids as $id) {
        // Get item details
        $stmt = $conn->prepare("SELECT * FROM inventory WHERE id = ?");
        $stmt->bind_param("s", $id); // 's' since your IDs are likely strings like '202506040001'
        $stmt->execute();
        $result = $stmt->get_result();
        $item = $result->fetch_assoc();
        $stmt->close();

        // Log deleted item to history
        if ($item) {
            $history_stmt = $conn->prepare("
                INSERT INTO history (
                    action, item_id, type, brand, quantity, remarks,
                    serial_number, issued_date, purchase_date, `condition`, location, status, action_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $action = 'Deleted';
            $issuedDate = !empty($item['issued_date']) ? $item['issued_date'] : NULL;
            $purchaseDate = !empty($item['purchase_date']) ? $item['purchase_date'] : NULL;

            $history_stmt->bind_param(
                "ssssisssssss",
                $action,
                $item['id'],
                $item['type'],
                $item['brand'],
                $item['quantity'],
                $item['remarks'],
                $item['serial_number'],
                $issuedDate,
                $purchaseDate,
                $item['condition'],
                $item['location'],
                $item['status']
            );

            $history_stmt->execute();
            $history_stmt->close();
        }
    }

    // Delete the items
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('s', count($ids)); // Use 's' for string item IDs
    $stmt = $conn->prepare("DELETE FROM inventory WHERE id IN ($placeholders)");

    // Dynamically bind the values
    $stmt->bind_param($types, ...$ids);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Items deleted successfully"]);
    } else {
        echo json_encode(["message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
}

$conn->close();
?>
