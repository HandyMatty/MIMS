<?php
include('cors.php');
include('database.php');

$response = array('success' => false, 'message' => 'Invalid token');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    $authStmt = $conn->prepare("SELECT id, username, token_expiry FROM users WHERE token = ?");
    $authStmt->bind_param("s", $token);
    $authStmt->execute();
    $authStmt->store_result();

    if ($authStmt->num_rows === 1) {
        $authStmt->bind_result($userId, $username, $token_expiry);
        $authStmt->fetch();
        if ($token_expiry !== null && $token_expiry < time()) {
            $response['message'] = 'Token expired';
        } else {
            $authStmt->close();
            $data = json_decode(file_get_contents("php://input"), true);
            $template_name = htmlspecialchars($data['template_name']);
            $type = htmlspecialchars($data['type']);
            $brand = htmlspecialchars($data['brand']);
            $condition = htmlspecialchars($data['condition']);
            $status = htmlspecialchars($data['status']);
            $quantity = intval($data['quantity']);
            $location = htmlspecialchars($data['location']);
            $remarks = htmlspecialchars($data['remarks'] ?? null);
            $created_by = $userId;
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
                $response = array(
                    'success' => false,
                    'message' => 'Error: Template name already exists.'
                );
            } else {
                $stmt = $conn->prepare("INSERT INTO saved_templates (
                    template_name, type, brand, `condition`, status, quantity, 
                    location, remarks, created_by, serial_number, purchase_date, issued_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("sssssissssss", 
                    $template_name, $type, $brand, $condition, $status, $quantity, 
                    $location, $remarks, $created_by, $serial_number, $purchase_date, $issued_date
                );
                if ($stmt->execute()) {
                    $response = array(
                        'success' => true,
                        'message' => 'Template saved successfully',
                        'id' => $conn->insert_id
                    );
                } else {
                    $response = array(
                        'success' => false,
                        'message' => 'Error: ' . $stmt->error
                    );
                }
                $stmt->close();
            }
        }
    } else {
        $authStmt->close();
        // Check if token ever existed (user logged in from another device)
        $stmt2 = $conn->prepare("SELECT id FROM users WHERE token_expiry IS NOT NULL AND token_expiry >= ?");
        $now = time();
        $stmt2->bind_param("i", $now);
        $stmt2->execute();
        $stmt2->store_result();
        if ($stmt2->num_rows > 0) {
            $response['message'] = 'Logged in from another device';
        } else {
            $response['message'] = 'User not found';
        }
        $stmt2->close();
    }
} else {
    $response['message'] = 'Authorization token not provided';
}

$conn->close();
echo json_encode($response);
?> 