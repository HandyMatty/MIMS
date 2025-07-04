<?php
include('cors.php');  
include('database.php'); 

$uploadDir = __DIR__ . '/../uploads/avatars/'; 

if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
    die(json_encode(['success' => false, 'message' => 'Upload directory does not exist or is not writable']));
}

$response = ['success' => false, 'message' => 'Invalid request'];

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

$stmt = $conn->prepare("SELECT id, avatar FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1 && isset($_FILES['avatar'])) {
    $stmt->bind_result($userId, $oldAvatar);
    $stmt->fetch();

    $file = $_FILES['avatar'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'File upload error: ' . $file['error'];
    } else {
        $fileName = uniqid() . "_" . basename($file["name"]);
        $targetFilePath = $uploadDir . $fileName;
        $imageFileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        if (!in_array($imageFileType, ['jpg', 'jpeg', 'png'])) {
            $response['message'] = 'Only JPG, JPEG, PNG files are allowed.';
        } else {
            if (move_uploaded_file($file["tmp_name"], $targetFilePath)) {
                if ($oldAvatar) {
                    $oldAvatarPath = __DIR__ . '/../uploads/avatars/' . basename($oldAvatar);
                    if (file_exists($oldAvatarPath)) {
                        unlink($oldAvatarPath);
                    }
                }

                $avatarUrl = 'http://localhost/Sentinel-MIMS/backend/uploads/avatars/' . $fileName;

                $stmtUpdate = $conn->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                $stmtUpdate->bind_param("si", $avatarUrl, $userId);

                if ($stmtUpdate->execute()) {
                    $response = [
                        'success' => true,
                        'message' => 'Avatar uploaded successfully',
                        'avatar' => $avatarUrl
                    ];
                } else {
                    $response['message'] = 'Failed to update the avatar in the database';
                }
                $stmtUpdate->close();
            } else {
                $response['message'] = 'Failed to move uploaded file. Please check directory permissions.';
            }
        }
    }
} else {
    $response['message'] = 'Invalid token or file missing';
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>
