<?php
include('cors.php');
include('database.php');

// Get the template ID from the URL
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Error: Invalid template ID"
    ]);
    exit;
}

// Delete the template
$stmt = $conn->prepare("DELETE FROM saved_templates WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Template deleted successfully"
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Template not found"
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