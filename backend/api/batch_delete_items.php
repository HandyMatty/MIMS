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

    $stmt = $conn->prepare("DELETE FROM inventory WHERE id = ?");
    $stmt->bind_param("s", $id);
    if ($stmt->execute()) {
        $action = 'Deleted';
        $hist = $conn->prepare("INSERT INTO history (action, item_id) VALUES (?, ?)");
        $hist->bind_param("ss", $action, $id);
        $hist->execute();
        $hist->close();

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