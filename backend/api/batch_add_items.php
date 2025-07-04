<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$items = $data['items'] ?? [];

$results = [];
$dateCounters = [];

foreach ($items as $index => $item) {
    if (
        empty($item['type']) ||
        empty($item['brand']) ||
        empty($item['quantity']) ||
        empty($item['condition']) ||
        empty($item['status']) ||
        empty($item['location']) ||
        empty($item['purchaseDate'])
    ) {
        $results[] = [
            'success' => false,
            'message' => "Missing required fields at item index $index",
            'item' => $item
        ];
        continue;
    }

    $type = htmlspecialchars($item['type']);
    $brand = htmlspecialchars($item['brand']);
    $serialNumber = htmlspecialchars($item['serialNumber'] ?? '');
    $issuedDate = htmlspecialchars($item['issuedDate'] ?? '');
    $purchaseDate = htmlspecialchars($item['purchaseDate']);
    $condition = htmlspecialchars($item['condition']);
    $location = htmlspecialchars($item['location']);
    $status = htmlspecialchars($item['status']);
    $remarks = htmlspecialchars($item['remarks'] ?? '');
    $quantity = intval($item['quantity']);

    $purchaseDateObj = DateTime::createFromFormat('Y-m-d', $purchaseDate);
    if (!$purchaseDateObj) {
        $results[] = [
            'success' => false,
            'message' => "Invalid purchase date format at index $index",
            'item' => $item
        ];
        continue;
    }
    $purchaseDateFormatted = $purchaseDateObj->format('Ymd');
    $purchaseDateSQL = $purchaseDateObj->format('Y-m-d');    

    if (!empty($serialNumber)) {
        $checkQuery = "SELECT COUNT(*) FROM inventory WHERE serial_number = ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param("s", $serialNumber);
        $checkStmt->execute();
        $checkStmt->bind_result($serialCount);
        $checkStmt->fetch();
        $checkStmt->close();

        if ($serialCount > 0) {
            $results[] = [
                'success' => false,
                'message' => "Serial number already exists at index $index",
                'item' => $item
            ];
            continue;
        }
    }

    if (!isset($dateCounters[$purchaseDateFormatted])) {
        $likeParam = $purchaseDateFormatted . '%';
        $stmt = $conn->prepare("SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("s", $likeParam);
        $stmt->execute();
        $stmt->bind_result($lastId);
        $stmt->fetch();
        $stmt->close();

        $lastCounter = $lastId ? intval(substr($lastId, -4)) : 0;
        $dateCounters[$purchaseDateFormatted] = $lastCounter;
    }

    $dateCounters[$purchaseDateFormatted]++;
    $counter = str_pad($dateCounters[$purchaseDateFormatted], 4, "0", STR_PAD_LEFT);
    $newId = $purchaseDateFormatted . $counter;

    $stmt = $conn->prepare("INSERT INTO inventory 
        (id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssssi", $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDateSQL, $condition, $location, $status, $remarks, $quantity);

    if ($stmt->execute()) {
        $action = 'Added';
        $hist = $conn->prepare("INSERT INTO history 
            (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $hist->bind_param("sssssssssssi", $action, $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDateSQL, $condition, $location, $status, $remarks, $quantity);
        $hist->execute();
        $hist->close();

        $results[] = [
            'success' => true,
            'message' => "Item added at index $index",
            'id' => $newId,
            'item' => $item
        ];
    } else {
        $results[] = [
            'success' => false,
            'message' => "Insert failed at index $index: " . $stmt->error,
            'item' => $item
        ];
    }

    $stmt->close();
}

$conn->close();
echo json_encode(['results' => $results]);
