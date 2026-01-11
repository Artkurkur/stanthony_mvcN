<?php
require_once __DIR__ . '/../app/Core/Database.php';
use App\Core\Database;

// Load env if needed, but Database.php might handle connection if config is hardcoded or env loaded globally.
// Assuming Database::connect() works if we include dependencies.
// We might need autoload for Dotenv if Database relies on it.

require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

try {
    $db = Database::connect();
    $stmt = $db->query("SELECT * FROM events");
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Total Events Found: " . count($events) . "\n";
    print_r($events);

} catch (Exception $e) {
    echo "Database Error: " . $e->getMessage();
}
