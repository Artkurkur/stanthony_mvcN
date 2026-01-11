<?php
require_once __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

$db = Database::connect();

try {
    // 1. Get recent events
    echo "Recent Events:\n";
    $stm = $db->query("SELECT event_id, event_name, batch_year FROM events ORDER BY event_id DESC LIMIT 5");
    $events = $stm->fetchAll(PDO::FETCH_ASSOC);
    print_r($events);

    if (empty($events))
        die("No events found.");

    // 2. Pick the first one (most recent) or one with batch_year
    $targetEventId = $events[0]['event_id'];
    foreach ($events as $ev) {
        if ($ev['batch_year']) {
            $targetEventId = $ev['event_id'];
            break;
        }
    }
    echo "\nTesting Event ID: $targetEventId\n";

    // 3. Check RSVP table
    echo "RSVP Records for Event $targetEventId:\n";
    $stm = $db->prepare("SELECT * FROM rsvp WHERE event_id = ?");
    $stm->execute([$targetEventId]);
    print_r($stm->fetchAll(PDO::FETCH_ASSOC));

    // CHECK ALUMNI BATCHES - DISTINCT
    echo "\nDistinct Batches in Alumni Table:\n";
    $stm = $db->query("SELECT DISTINCT batch_year FROM alumni");
    print_r($stm->fetchAll(PDO::FETCH_ASSOC));

    // Check specific 2016 types
    $stm = $db->query("SELECT member_id, fname, batch_year FROM alumni WHERE batch_year LIKE '%2016%' LIMIT 1");
    $match2016 = $stm->fetch(PDO::FETCH_ASSOC);
    echo "\nUser matching 2016:\n";
    print_r($match2016);
    if ($match2016) {
        echo "Hex of batch_year: " . bin2hex($match2016['batch_year']) . "\n";
    }


    // 4. Granular Query Check
    echo "\n--- Granular Debug ---\n";

    // Get Event Batch
    $stm = $db->prepare("SELECT batch_year FROM events WHERE event_id = ?");
    $stm->execute([$targetEventId]);
    $res = $stm->fetch(PDO::FETCH_ASSOC);
    $eventBatch = $res['batch_year'];
    echo "Event ID: $targetEventId, Batch: " . var_export($eventBatch, true) . "\n";

    // Count Alumni with that batch
    $stm = $db->prepare("SELECT count(*) as c FROM alumni WHERE batch_year = ?");
    $stm->execute([$eventBatch]);
    $cnt = $stm->fetch(PDO::FETCH_ASSOC);
    echo "Alumni with batch '$eventBatch': " . $cnt['c'] . "\n";

    // Try Join with TRIM
    echo "Testing JOIN query with TRIM:\n";
    $q = "SELECT count(*) as c FROM alumni a JOIN events e ON e.event_id = ? WHERE TRIM(a.batch_year) = TRIM(e.batch_year)";
    $stm = $db->prepare($q);
    $stm->execute([$targetEventId]);
    $res = $stm->fetch(PDO::FETCH_ASSOC);
    echo "Matches via JOIN (TRIM): " . $res['c'] . "\n";


} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
