<?php
include('cors.php');
include('database.php');

$query = "SELECT * FROM inventory";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $items = [];
    while($row = $result->fetch_assoc()) {
        $items[] = [
            "id" => $row["id"],
            "type" => $row["type"],
            "brand" => $row["brand"],
            "serialNumber" => $row["serial_number"],
            "date" => $row["date"],
            "condition" => $row["condition"],
            "location" => $row["location"],
            "status" => $row["status"]
        ];
    }
    header('Content-Type: application/json');
    echo json_encode($items);
} else {
    echo json_encode(["error" => "No items found"]);
}

$conn->close();
?>
