<?php
include('cors.php');  
include('database.php');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log request method and headers
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request Headers: " . print_r(getallheaders(), true));

include('database.php');

// Get POST data
$raw_data = file_get_contents("php://input");
error_log("Raw input data: " . $raw_data);

$data = json_decode($raw_data, true);
error_log("Decoded data: " . print_r($data, true));

if (!isset($data['userId']) || !isset($data['department'])) {
    error_log("Missing required fields. Data received: " . print_r($data, true));
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields',
        'received_data' => $data
    ]);
    exit;
}

$userId = $data['userId'];
$department = $data['department'];

try {
    // Update the user's department
    $query = "UPDATE users SET department = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("si", $department, $userId);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Department updated successfully'
        ]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
} catch (Exception $e) {
    error_log("Error in update_department.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error updating department: ' . $e->getMessage()
    ]);
}

if (isset($stmt)) {
    $stmt->close();
}
$conn->close();
?> 