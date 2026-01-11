<?php
require_once __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    $sql = file_get_contents('create_notifications_table.sql');
    if ($sql) {
        $db->exec($sql);
        echo "Table notifications created successfully.\n";
    } else {
        echo "SQL file empty or not found.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
