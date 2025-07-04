<?php
include('cors.php');
include('database.php');

$data = json_decode(file_get_contents("php://input"), true);

$template_name = htmlspecialchars($data['template_name']);
$type = htmlspecialchars($data['type']);
$brand = htmlspecialchars($data['brand']);
$condition = htmlspecialchars($data['condition']);
$status = htmlspecialchars($data['status']);
$quantity = intval($data['quantity']);
$location = htmlspecialchars($data['location']);
$remarks = htmlspecialchars($data['remarks'] ?? null);
$created_by = htmlspecialchars($data['created_by'] ?? 'System');
$serial_number = htmlspecialchars($data['serialNumber'] ?? null);
$purchase_date = htmlspecialchars($data['purchaseDate'] ?? null);
$issued_date = !empty($data['issuedDate']) ? htmlspecialchars($data['issuedDate']) : null;

$checkQuery = "SELECT COUNT(*) FROM saved_templates WHERE template_name = ?";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("s", $template_name);
$checkStmt->execute();
$checkStmt->bind_result($templateCount);
$checkStmt->fetch();
$checkStmt->close();

if ($templateCount > 0) {
    http_response_code(400);
    echo json_encode(["message" => "Error: Template name already exists."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO saved_templates (
    template_name, type, brand, `condition`, status, quantity, 
    location, remarks, created_by, serial_number, purchase_date, issued_date
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("sssssissssss", 
    $template_name, $type, $brand, $condition, $status, $quantity, 
    $location, $remarks, $created_by, $serial_number, $purchase_date, $issued_date
);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Template saved successfully",
        "id" => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?> 