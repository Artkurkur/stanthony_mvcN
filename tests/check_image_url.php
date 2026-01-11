<?php
require __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    $stmt = $db->query("SELECT member_id, profile_picture FROM alumni WHERE member_id = 13");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "ID: " . $user['member_id'] . "\n";
    echo "Pic: " . $user['profile_picture'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
