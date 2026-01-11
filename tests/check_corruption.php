<?php
require __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    $stmt = $db->query("SELECT * FROM alumni WHERE fname IS NULL OR fname = '' OR lname IS NULL OR lname = '' OR batch_year IS NULL OR batch_year = ''");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($users) > 0) {
        echo "Found " . count($users) . " corrupted users:\n";
        foreach ($users as $user) {
            echo "ID: " . $user['member_id'] . " User: " . $user['username'] . "\n";
        }
    } else {
        echo "No corrupted users found.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
