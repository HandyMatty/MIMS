<?php
include('cors.php');
include('database.php');

// Get the POST data
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

// Fetch the last item with the same purchase date
$query = "SELECT id FROM inventory WHERE id LIKE ? ORDER BY id DESC LIMIT 1";
$stmt = $conn->prepare($query);
$likeParam = $purchaseDateFormatted . "%";
$stmt->bind_param("s", $likeParam);
$stmt->execute();
$stmt->bind_result($lastId);
$stmt->fetch();
$stmt->close();

// Generate new ID
if ($lastId) {
    $lastCounter = (int)substr($lastId, -2); // Extract last two digits
    $newCounter = str_pad($lastCounter + 1, 2, "0", STR_PAD_LEFT);
} else {
    $newCounter = "01"; // Start with 01 if no previous item exists
}
$newId = $purchaseDateFormatted . $newCounter;

// Insert into inventory
$stmt = $conn->prepare("INSERT INTO inventory (id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssssi", $newId, $type, $brand, $serialNumber, $issuedDate, $purchaseDate, $condition, $location, $status, $remarks, $quantity);

// Format purchase date for ID generation (YYYYMMDD)

if ($stmt->execute()) {
    // Record in history
    $history_stmt = $conn->prepare("INSERT INTO history (action, item_id, type, brand, serial_number, issued_date, purchase_date, `condition`, location, status, remarks, quantity) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");    

    $history_action = 'added';
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
