<?php
require __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    // Find logs for user 13
    $stmt = $db->query("SELECT details FROM system_logs WHERE user_id = 13 AND action = 'login' ORDER BY created_at DESC LIMIT 1");
    $log = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($log) {
        echo "Found Log: " . $log['details'] . "\n";
    } else {
        echo "No login logs for user 13.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
