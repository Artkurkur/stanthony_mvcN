<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// ✅ Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// ------------------------------------------------------------
// ✅ Enable CORS (Cross-Origin Resource Sharing)
// ------------------------------------------------------------
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight (OPTIONS) requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ------------------------------------------------------------
// Load Core Classes
// ------------------------------------------------------------
require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../app/Core/Response.php';
require_once __DIR__ . '/../app/Core/Router.php';

// ------------------------------------------------------------
// Autoloader (PSR-4 Compatible)
// ------------------------------------------------------------
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        // Not in the App namespace, skip
        return;
    }

    // Remove prefix and replace backslashes with directory slashes
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

// ------------------------------------------------------------
// Initialize Router
// ------------------------------------------------------------
use App\Core\Router;
use App\Core\Response;

$router = new Router();

// ------------------------------------------------------------
// Load API Routes
// ------------------------------------------------------------
require_once __DIR__ . '/../app/Routes/api.php';

// ------------------------------------------------------------
// Run the Router
// ------------------------------------------------------------
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

