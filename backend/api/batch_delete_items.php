<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$itemIds = $data['itemIds'] ?? [];

$results = [];

foreach ($itemIds as $id) {
    if (empty($id)) {
        $results[] = [
            'success' => false,
            'message' => 'Missing item ID',
            'id' => $id
        ];
        continue;
    }

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

    $stmt = $conn->prepare("DELETE FROM inventory WHERE id = ?");
    $stmt->bind_param("s", $id);
    if ($stmt->execute()) {
        $results[] = [
            'success' => true,
            'message' => 'Item deleted',
            'id' => $id
        ];
    } else {
        $results[] = [
            'success' => false,
            'message' => 'Failed to delete item: ' . $stmt->error,
            'id' => $id
        ];
    }
    $stmt->close();
}

$conn->close();
echo json_encode(['results' => $results]); 