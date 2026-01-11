<?php
require __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    // Check specifically for ID 11 which we saw earlier
    $stmt = $db->query("SELECT * FROM alumni WHERE member_id = 11");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "ID: " . $user['member_id'] . "\n";
        echo "Name: '" . $user['fname'] . "' '" . $user['lname'] . "'\n";
        echo "User: '" . $user['username'] . "'\n";
        echo "Batch: '" . $user['batch_year'] . "'\n";
        echo "Mobile: '" . $user['mobile_number'] . "'\n";
        echo "Pic: '" . $user['profile_picture'] . "'\n";
    } else {
        echo "User 11 not found.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
