<?php
include('cors.php');
include('database.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$items = $data['items'] ?? [];

$results = [];

foreach ($items as $item) {
    if (
        empty($item['id']) ||
        empty($item['type']) ||
        empty($item['brand']) ||
        empty($item['quantity']) ||
        empty($item['condition']) ||
        empty($item['status']) ||
        empty($item['location'])
    ) {
        $results[] = [
            'success' => false,
            'message' => 'Missing required fields',
            'item' => $item
        ];
        continue;
    }

    $id = $item['id'];
    $type = $item['type'];
    $brand = $item['brand'];
    $quantity = intval($item['quantity']);
    $remarks = $item['remarks'] ?? '';
    $serialNumber = $item['serialNumber'] ?? '';
    $issuedDate = !empty($item['issuedDate']) ? $item['issuedDate'] : null;
    $purchaseDate = !empty($item['purchaseDate']) ? $item['purchaseDate'] : null;
    $condition = $item['condition'];
    $location = $item['location'];
    $status = $item['status'];

    $stmt = $conn->prepare("UPDATE inventory SET type=?, brand=?, quantity=?, remarks=?, serialNumber=?, issuedDate=?, purchaseDate=?, `condition`=?, location=?, status=? WHERE id=?");
    $stmt->bind_param(
        "ssisssssssi",
        $type,
        $brand,
        $quantity,
        $remarks,
        $serialNumber,
        $issuedDate,
        $purchaseDate,
        $condition,
        $location,
        $status,
        $id
    );
    if ($stmt->execute()) {
        $results[] = [
            'success' => true,
            'message' => 'Item updated successfully',
            'id' => $id,
            'item' => $item
        ];
    } else {
        $results[] = [
            'success' => false,
            'message' => 'Failed to update item: ' . $stmt->error,
            'item' => $item
        ];
    }
    $stmt->close();
}

$conn->close();
echo json_encode(['results' => $results]); 