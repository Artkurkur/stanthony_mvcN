<?php
require __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    $stmt = $db->prepare("UPDATE alumni SET role_id = 2 WHERE member_id = 13");
    $stmt->execute();
    echo "Role ID restored for user 13.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
