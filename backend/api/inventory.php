<?php
include('cors.php');
include('database.php');

$response = [
    "totalEquipment" => 0,
    "deployed" => 0,
    "available" => 0,
    "goodCondition" => 0,
    "defective" => 0,
    "forrepair" => 0
];

// Fetch counts from the inventory table
$query = "SELECT 
            COUNT(*) AS totalEquipment,
            SUM(status = 'Deployed') AS deployed,
            SUM(status = 'Available') AS available,
            SUM(`condition` = 'Good') AS goodCondition,
            SUM(`condition` = 'Defective') AS defective,
            SUM(status = 'For Repair') AS forrepair
          FROM inventory";

$result = $conn->query($query);

if ($result && $row = $result->fetch_assoc()) {
    $response = [
        "totalEquipment" => (int)$row["totalEquipment"],
        "deployed" => (int)$row["deployed"],
        "available" => (int)$row["available"],
        "goodCondition" => (int)$row["goodCondition"],
        "defective" => (int)$row["defective"],
        "forrepair" => (int)$row["forrepair"]
    ];
}

// Return the response as JSON
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
$conn->close();
?>
