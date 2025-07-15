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
            
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if (!$id) {
                $response = array(
                    'success' => false,
                    'message' => 'Error: Invalid template ID'
                );
            } else {
                $checkStmt = $conn->prepare("SELECT id, created_by FROM saved_templates WHERE id = ?");
                $checkStmt->bind_param("i", $id);
                $checkStmt->execute();
                $checkStmt->store_result();

                if ($checkStmt->num_rows === 1) {
                    $checkStmt->bind_result($templateId, $createdBy);
                    $checkStmt->fetch();
                    $checkStmt->close();

                    if ($createdBy == $userId) {
                        $data = json_decode(file_get_contents("php://input"), true);

                        $required_fields = ['template_name', 'type', 'brand', 'condition', 'status', 'location'];
                        $missing_fields = [];
                        foreach ($required_fields as $field) {
                            if (!isset($data[$field]) || empty($data[$field])) {
                                $missing_fields[] = $field;
                            }
                        }

                        if (!empty($missing_fields)) {
                            $response = array(
                                'success' => false,
                                'message' => 'Error: Missing required field(s): ' . implode(', ', $missing_fields)
                            );
                        } else {
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
                                $response = array(
                                    'success' => false,
                                    'message' => 'Error: Template name already exists.'
                                );
                            } else {
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
                                        $response = array(
                                            'success' => true,
                                            'message' => 'Template updated successfully'
                                        );
                                    } else {
                                        $response = array(
                                            'success' => false,
                                            'message' => 'Template not found or no changes made'
                                        );
                                    }
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
                        $response = array(
                            'success' => false,
                            'message' => 'Error: You can only update templates that you created'
                        );
                    }
                } else {
                    $checkStmt->close();
                    $response = array(
                        'success' => false,
                        'message' => 'Error: Template not found'
                    );
                }
            }
        }
    } else {
        $authStmt->close();
        $response['message'] = 'Invalid token';
    }
} else {
    $response['message'] = 'Authorization token not provided';
}

$conn->close();
echo json_encode($response);
?> 