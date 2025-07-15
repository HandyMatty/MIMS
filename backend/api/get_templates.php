<?php
include('cors.php');
include('database.php');

$response = array('success' => false, 'message' => 'Invalid token');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    $authStmt = $conn->prepare("SELECT id, token_expiry FROM users WHERE token = ?");
    $authStmt->bind_param("s", $token);
    $authStmt->execute();
    $authStmt->store_result();

    if ($authStmt->num_rows === 1) {
        $authStmt->bind_result($userId, $token_expiry);
        $authStmt->fetch();
        if ($token_expiry !== null && $token_expiry < time()) {
            $response['message'] = 'Token expired';
        } else {
            $authStmt->close();
            $query = "SELECT t.*, u.username as creator_username 
                      FROM saved_templates t 
                      LEFT JOIN users u ON t.created_by = u.id 
                      ORDER BY t.created_at DESC";
            $result = $conn->query($query);

            if ($result) {
                $templates = [];
                while ($row = $result->fetch_assoc()) {
                    $templates[] = [
                        'id' => $row['id'],
                        'template_name' => $row['template_name'],
                        'type' => $row['type'],
                        'brand' => $row['brand'],
                        'condition' => $row['condition'],
                        'status' => $row['status'],
                        'quantity' => $row['quantity'],
                        'location' => $row['location'],
                        'remarks' => $row['remarks'],
                        'created_at' => $row['created_at'],
                        'created_by' => $row['creator_username'] ?? 'Unknown User',
                        'serialNumber' => $row['serial_number'],
                        'purchaseDate' => $row['purchase_date'],
                        'issuedDate' => $row['issued_date']
                    ];
                }
                $response = array(
                    'success' => true,
                    'templates' => $templates
                );
            } else {
                $response = array(
                    'success' => false,
                    'message' => 'Error: ' . $conn->error
                );
            }
            echo json_encode($response);
            $conn->close();
            return;
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