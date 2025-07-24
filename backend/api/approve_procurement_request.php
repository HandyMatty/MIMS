<?php
include('cors.php');
include('database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$request_id = $data['request_id'] ?? null;
$approver_id = $data['approver_id'] ?? null;

if (!$request_id || !$approver_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("UPDATE procurement_requests SET status = 'Approved' WHERE id = ?");
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("UPDATE procurement_items SET status = 'Approved' WHERE request_id = ?");
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $stmt->close();


    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Procurement request approved. Items are now ready for inventory finalization.']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
$conn->close(); 