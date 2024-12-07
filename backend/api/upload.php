<?php
include('cors.php');  
include('database.php'); 

// Use an absolute path to avoid any path-related issues
$uploadDir = __DIR__ . '/../uploads/avatars/'; 

// Check if the directory exists and is writable
if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
    die(json_encode(['success' => false, 'message' => 'Upload directory does not exist or is not writable']));
}

$response = ['success' => false, 'message' => 'Invalid request'];

// Get Authorization header
$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

// Validate token and get user ID
$stmt = $conn->prepare("SELECT id, avatar FROM users WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1 && isset($_FILES['avatar'])) {
    $stmt->bind_result($userId, $oldAvatar);
    $stmt->fetch();

    $file = $_FILES['avatar'];

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'File upload error: ' . $file['error'];
    } else {
        // Generate a unique file name to avoid overwriting
        $fileName = uniqid() . "_" . basename($file["name"]);
        $targetFilePath = $uploadDir . $fileName;
        $imageFileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        // Validate file type (allow only jpg, jpeg, png)
        if (!in_array($imageFileType, ['jpg', 'jpeg', 'png'])) {
            $response['message'] = 'Only JPG, JPEG, PNG files are allowed.';
        } else {
            // Move the uploaded file to the target directory
            if (move_uploaded_file($file["tmp_name"], $targetFilePath)) {
                // If there was a previous avatar, delete it
                if ($oldAvatar) {
                    // Extract the filename from the URL and delete the file
                    $oldAvatarPath = __DIR__ . '/../uploads/avatars/' . basename($oldAvatar);
                    if (file_exists($oldAvatarPath)) {
                        unlink($oldAvatarPath); // Delete the old avatar
                    }
                }

                // Construct the avatar URL
                $avatarUrl = 'http://localhost/MIMS/backend/uploads/avatars/' . $fileName;

                // Update the user's avatar in the database
                $stmtUpdate = $conn->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                $stmtUpdate->bind_param("si", $avatarUrl, $userId);

                if ($stmtUpdate->execute()) {
                    $response = [
                        'success' => true,
                        'message' => 'Avatar uploaded successfully',
                        'avatar' => $avatarUrl // Return the full URL of the uploaded avatar
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
