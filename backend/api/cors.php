<?php
// CORS headers to allow cross-origin requests
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, x-requested-with");
header("X-Content-Type-Options: nosniff");
header("Content-Security-Policy: frame-ancestors 'none';");

header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

// Dynamically set Content-Type based on file type
if (isset($_SERVER['REQUEST_URI'])) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $extension = pathinfo($path, PATHINFO_EXTENSION);

    switch ($extension) {
        case 'js':
            header("Content-Type: application/javascript");
            break;
        case 'css':
            header("Content-Type: text/css");
            break;
        case 'json':
            header("Content-Type: application/json");
            break;
        case 'html':
        case 'htm':
            header("Content-Type: text/html");
            break;
        default:
            header("Content-Type: text/plain"); // Default to plain text
            break;
    }
}

// Exit early for OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
?>
