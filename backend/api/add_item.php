<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents("php://input"), true);

$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$serialNumber = htmlspecialchars($data['serialNumber'] ?? '');
$issuedDate = htmlspecialchars($data['issuedDate'] ?? '');
$purchaseDate = htmlspecialchars($data['purchaseDate']);
$condition = htmlspecialchars($data['condition']);
$location = htmlspecialchars($data['location']);
$status = htmlspecialchars($data['status']);
$remarks = htmlspecialchars($data['remarks'] ?? '');
$quantity = intval($data['quantity']); 

if (!empty($serialNumber)) {
    $checkQuery = "SELECT COUNT(*) FROM inventory WHERE serial_number = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("s", $serialNumber);
    $checkStmt->execute();
    $checkStmt->bind_result($serialCount);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($serialCount > 0) {
        http_response_code(400);
        echo json_encode(["message" => "Error: Serial Number already exists."]);
        exit;
    }
}

$purchaseDateFormatted = date("Ymd", strtotime($purchaseDate));

$query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
$stmt = $conn->prepare($query);
$likeParam = $purchaseDateFormatted . "%";
$stmt->bind_param("s", $likeParam);
$stmt->execute();
$stmt->bind_result($lastId);
$stmt->fetch();
$stmt->close();

if ($lastId) {
    $lastCounter = (int)substr($lastId, -4);
    $newCounter = str_pad($lastCounter + 1, 4, "0", STR_PAD_LEFT);
} else {
    $newCounter = "0001";
}
$newId = $purchaseDateFormatted . $newCounter;

$stmt = $conn->prepare("INSERT INTO inventory (id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssssi", $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity);


if ($stmt->execute()) {
    $history_stmt = $conn->prepare("INSERT INTO history (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");    

    $history_action = 'Added';
    $history_stmt->bind_param("sssssssssssi", $history_action, $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity);
    $history_stmt->execute();
    $history_stmt->close();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Item added successfully",
        "id" => $newId
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
