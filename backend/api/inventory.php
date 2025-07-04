<?php
include('cors.php');
include('database.php');

$response = [
    "totalEquipment" => 0,
    "BrandNew" => 0,
    "deployed" => 0,
    "OnStock" => 0,
    "goodCondition" => 0,
    "defective" => 0,
    "forrepair" => 0
];

$query = "SELECT 
            COUNT(*) AS totalEquipment,
            SUM(`condition` = 'Brand New') AS BrandNew,
            SUM(status = 'Deployed') AS deployed,
            SUM(status = 'On Stock') AS OnStock,
            SUM(`condition` = 'Good Condition') AS goodCondition,
            SUM(`condition` = 'Defective') AS defective,
            SUM(status = 'For Repair') AS forrepair
          FROM inventory";

$result = $conn->query($query);

if ($result && $row = $result->fetch_assoc()) {
    $response = [
        "totalEquipment" => (int)$row["totalEquipment"],
        "BrandNew" => (int)$row["BrandNew"],
        "deployed" => (int)$row["deployed"],
        "OnStock" => (int)$row["OnStock"],
        "goodCondition" => (int)$row["goodCondition"],
        "defective" => (int)$row["defective"],
        "forrepair" => (int)$row["forrepair"]
    ];
}

header('Content-Type: application/json');
echo json_encode($response);

$conn->close();
?>
