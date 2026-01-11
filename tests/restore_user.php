<?php
require __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();
    $sql = "UPDATE alumni SET 
            fname = :fname, 
            lname = :lname, 
            username = :username, 
            mobile_number = :mobile, 
            batch_year = :batch 
            WHERE member_id = 13";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':fname' => 'Gerald',
        ':lname' => 'Marquez',
        ':username' => 'Rald123',
        ':mobile' => '09345678911',
        ':batch' => '2000'
    ]);

    echo "User 13 restored successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
