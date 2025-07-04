<?php
include('cors.php');
include('database.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$items = $data['items'] ?? [];

$results = [];

foreach ($items as $item) {
    $id = $item['id'] ?? $item['ID'] ?? null;
    $type = $item['type'] ?? '';
    $brand = $item['brand'] ?? '';
    $quantity = isset($item['quantity']) ? intval($item['quantity']) : 0;
    $remarks = $item['remarks'] ?? '';
    $serialNumber = $item['serial_number'] ?? $item['serialNumber'] ?? '';
    $issuedDate = !empty($item['issued_date']) ? $item['issued_date'] : (!empty($item['issuedDate']) ? $item['issuedDate'] : null);
    $purchaseDate = !empty($item['purchase_date']) ? $item['purchase_date'] : (!empty($item['purchaseDate']) ? $item['purchaseDate'] : null);
    $condition = $item['condition'] ?? '';
    $location = $item['location'] ?? '';
    $status = $item['status'] ?? '';

    if (
        empty($id) ||
        empty($type) ||
        empty($brand) ||
        empty($quantity) ||
        empty($condition) ||
        empty($status) ||
        empty($location)
    ) {
        $results[] = [
            'success' => false,
            'message' => 'Missing required fields',
            'item' => $item
        ];
        continue;
    }

    // Fetch existing item
    $query = "SELECT * FROM inventory WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingItem = $result->fetch_assoc();
    $stmt->close();

    if (!$existingItem) {
        $results[] = [
            'success' => false,
            'message' => 'Item not found',
            'item' => $item
        ];
        continue;
    }

    // ID reformatting logic
    $inputPurchaseDateFormatted = date("Ymd", strtotime($purchaseDate));
    $existingPurchaseDateFormatted = date("Ymd", strtotime($existingItem['purchase_date']));
    $existingIdStartsWithDate = str_starts_with((string)$existingItem['id'], $inputPurchaseDateFormatted);
    $needsIdFormatFix = !preg_match('/^' . $inputPurchaseDateFormatted . '\\d{4}$/', $existingItem['id']);

    if ($inputPurchaseDateFormatted === $existingPurchaseDateFormatted && $existingIdStartsWithDate && !$needsIdFormatFix) {
        $newItemId = $existingItem['id'];
    } else {
        $purchaseDateFormatted = $inputPurchaseDateFormatted;
        $query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
        $stmt = $conn->prepare($query);
        $likeParam = $purchaseDateFormatted . "%";
        $stmt->bind_param("s", $likeParam);
        $stmt->execute();
        $stmt->bind_result($lastItemId);
        $stmt->fetch();
        $stmt->close();

        if ($lastItemId && preg_match('/^' . $purchaseDateFormatted . '(\\d{1,4})$/', $lastItemId, $matches)) {
            $lastCounter = (int)$matches[1];
            $newCounter = str_pad($lastCounter + 1, 4, "0", STR_PAD_LEFT);
        } else {
            $newCounter = "0001";
        }

        $newItemId = $purchaseDateFormatted . $newCounter;
    }

    // Serial number uniqueness check for new format
    $isNewFormat = str_starts_with((string)$newItemId, '20');
    if (!empty($serialNumber) && $isNewFormat) {
        $checkSerialQuery = "
            SELECT id FROM inventory 
            WHERE TRIM(UPPER(serial_number)) = ? 
            AND id != ?
            AND id LIKE '20%'
        ";
        $stmt = $conn->prepare($checkSerialQuery);
        $stmt->bind_param("si", $serialNumber, $id);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $results[] = [
                'success' => false,
                'message' => 'Serial number already exists for a different purchase date.',
                'item' => $item
            ];
            $stmt->close();
            continue;
        }
        $stmt->close();
    }

    // Change detection
    $changes = [];
    if ($existingItem['id'] !== $newItemId) $changes['Item ID'] = ["old" => $existingItem['id'], "new" => $newItemId];
    if ($existingItem['type'] !== $type) $changes['Type'] = ["old" => $existingItem['type'], "new" => $type];
    if ($existingItem['brand'] !== $brand) $changes['Brand'] = ["old" => $existingItem['brand'], "new" => $brand];
    if ($existingItem['serial_number'] !== $serialNumber) $changes['Serial Number'] = ["old" => $existingItem['serial_number'], "new" => $serialNumber];
    if ($existingItem['issued_date'] !== $issuedDate) $changes['Issued Date'] = ["old" => $existingItem['issued_date'], "new" => $issuedDate];
    if ($existingItem['purchase_date'] !== $purchaseDate) $changes['Purchase Date'] = ["old" => $existingItem['purchase_date'], "new" => $purchaseDate];
    if ($existingItem['condition'] !== $condition) $changes['Condition'] = ["old" => $existingItem['condition'], "new" => $condition];
    if ($existingItem['location'] !== $location) $changes['Location'] = ["old" => $existingItem['location'], "new" => $location];
    if ($existingItem['status'] !== $status) $changes['Status'] = ["old" => $existingItem['status'], "new" => $status];
    if ($existingItem['remarks'] !== $remarks) $changes['Remarks'] = ["old" => $existingItem['remarks'], "new" => $remarks];
    if ($existingItem['quantity'] !== $quantity) $changes['Quantity'] = ["old" => $existingItem['quantity'], "new" => $quantity];

    if (empty($changes)) {
        $results[] = [
            'success' => true,
            'message' => 'No changes detected',
            'id' => $id,
            'item' => $item
        ];
        continue;
    }

    // History logging
    $fieldChanged = json_encode(array_keys($changes));
    $oldValues = json_encode(array_column($changes, "old"));
    $newValues = json_encode(array_column($changes, "new"));

    $history_stmt = $conn->prepare("
        INSERT INTO history (action, item_id, field_changed, old_value, new_value, action_date)
        VALUES ('Updated', ?, ?, ?, ?, NOW())
    ");
    $history_stmt->bind_param("isss", $id, $fieldChanged, $oldValues, $newValues);
    $history_stmt->execute();
    $history_stmt->close();

    // Update item
    $update_stmt = $conn->prepare("
        UPDATE inventory 
        SET id = ?, type = ?, brand = ?, serial_number = ?, issued_date = ?, purchase_date = ?, `condition` = ?, location = ?, status = ?, remarks = ?, quantity = ?
        WHERE id = ?
    ");
    $update_stmt->bind_param("ssssssssssis", $newItemId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity, $id);

    if ($update_stmt->execute()) {
        $results[] = [
            'success' => true,
            'message' => 'Item updated successfully',
            'id' => $newItemId,
            'item' => $item
        ];
    } else {
        $results[] = [
            'success' => false,
            'message' => 'Error: ' . $update_stmt->error,
            'item' => $item
        ];
    }
    $update_stmt->close();
}

$conn->close();
echo json_encode(['results' => $results]); 