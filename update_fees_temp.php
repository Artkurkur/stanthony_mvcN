<?php
require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

try {
    // Manually load Env
    require_once __DIR__ . '/app/Core/Env.php';
    $db = Database::connect();
    // Activate fees 1, 2, 3, 4
    $stmt = $db->prepare("UPDATE fees SET is_active = 1 WHERE fee_id IN (1, 2, 3, 4)");
    $stmt->execute();
    echo "Fees 1, 2, 3, 4 have been activated successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
