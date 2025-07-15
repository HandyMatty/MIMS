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
                        $stmt = $conn->prepare("DELETE FROM saved_templates WHERE id = ?");
                        $stmt->bind_param("i", $id);

                        if ($stmt->execute()) {
                            if ($stmt->affected_rows > 0) {
                                $response = array(
                                    'success' => true,
                                    'message' => 'Template deleted successfully'
                                );
                            } else {
                                $response = array(
                                    'success' => false,
                                    'message' => 'Template not found'
                                );
                            }
                        } else {
                            $response = array(
                                'success' => false,
                                'message' => 'Error: ' . $stmt->error
                            );
                        }
                        $stmt->close();
                    } else {
                        $response = array(
                            'success' => false,
                            'message' => 'Error: You can only delete templates that you created'
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