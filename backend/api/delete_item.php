<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['ids'])) {
    $ids = $data['ids'];

    foreach ($ids as $id) {
        $stmt = $conn->prepare("SELECT * FROM inventory WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $item = $result->fetch_assoc();
        $stmt->close();

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

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $types = str_repeat('s', count($ids));
    $stmt = $conn->prepare("DELETE FROM inventory WHERE id IN ($placeholders)");

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
