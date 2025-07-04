<?php
include('cors.php');
include('database.php');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "Error: Invalid template ID"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$required_fields = ['template_name', 'type', 'brand', 'condition', 'status', 'location'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(["message" => "Error: Missing required field: $field"]);
        exit;
    }
}

$template_name = htmlspecialchars($data['template_name']);
$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$condition = htmlspecialchars($data['condition']);
$status = htmlspecialchars($data['status']);
$quantity = intval($data['quantity']);
$location = htmlspecialchars($data['location']);
$remarks = htmlspecialchars($data['remarks'] ?? null);
$serial_number = htmlspecialchars($data['serialNumber'] ?? null);
$purchase_date = htmlspecialchars($data['purchaseDate'] ?? null);
$issued_date = htmlspecialchars($data['issuedDate'] ?? null);

$checkQuery = "SELECT COUNT(*) FROM saved_templates WHERE template_name = ? AND id != ?";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("si", $template_name, $id);
$checkStmt->execute();
$checkStmt->bind_result($templateCount);
$checkStmt->fetch();
$checkStmt->close();

if ($templateCount > 0) {
    http_response_code(400);
    echo json_encode(["message" => "Error: Template name already exists."]);
    exit;
}

$stmt = $conn->prepare("UPDATE saved_templates 
    SET template_name = ?, 
        type = ?, 
        brand = ?, 
        `condition` = ?, 
        status = ?, 
        quantity = ?, 
        location = ?, 
        remarks = ?,
        serial_number = ?,
        purchase_date = ?,
        issued_date = ?
    WHERE id = ?");

$stmt->bind_param("sssssisssssi", 
    $template_name, 
    $type, 
    $brand, 
    $condition, 
    $status, 
    $quantity, 
    $location, 
    $remarks,
    $serial_number,
    $purchase_date,
    $issued_date,
    $id
);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Template updated successfully"
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Template not found or no changes made"
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?> 