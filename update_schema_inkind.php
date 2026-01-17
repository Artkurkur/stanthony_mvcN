<?php
require_once __DIR__ . '/app/Core/Env.php'; // Ensure Env is loaded if Database uses it
require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::connect();

    // Check if column exists
    $check = $db->query("SHOW COLUMNS FROM transaction_details LIKE 'item_description'");
    if ($check->rowCount() == 0) {
        $sql = "ALTER TABLE transaction_details ADD COLUMN item_description VARCHAR(255) NULL AFTER paid_amount";
        $db->exec($sql);
        echo "Column 'item_description' added successfully.\n";
    } else {
        echo "Column 'item_description' already exists.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
