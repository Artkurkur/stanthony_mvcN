<?php
require_once __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::connect();

    $events = $db->query("SELECT COUNT(*) FROM events")->fetchColumn();
    $announcements = $db->query("SELECT COUNT(*) FROM announcements")->fetchColumn();
    $notifications = $db->query("SELECT COUNT(*) FROM notifications")->fetchColumn();

    echo "Events: $events\n";
    echo "Announcements: $announcements\n";
    echo "Notifications: $notifications\n";

    // Check if any admin exists
    $admin = $db->query("SELECT member_id, username FROM alumni WHERE role_id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if ($admin) {
        echo "Admin Found: " . $admin['username'] . " (ID: " . $admin['member_id'] . ")\n";
    } else {
        echo "No Admin found.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
