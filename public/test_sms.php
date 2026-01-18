<?php
// Simple test script for SMS Service

// Autoload (adjust path if needed)
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../app/Services/SmsService.php';

use App\Services\SmsService;

// Check if running from browser or CLI
$isCli = php_sapi_name() === 'cli';

if (!$isCli) {
    header('Content-Type: text/plain');
}

echo "SMS Gateway Test\n";
echo "Connecting to Android Gateway at http://127.0.0.1:8080 ...\n\n";

$sms = new SmsService();

// You can change these values
$testNumber = isset($_GET['phone']) ? $_GET['phone'] : '09706826068';
$testMessage = "Hello from St Anthony MVC! " . date('H:i:s');

echo "Sending to: $testNumber\n";
echo "Message: $testMessage\n\n";

// Method: POST /send-sms (JSON)
echo "--- Sending SMS ---\n";
$result = $sms->send($testNumber, $testMessage);
print_r($result);

if (!$isCli) {
    echo "</pre>";
    echo "<p>To test with real data: ?phone=YOUR_NUMBER</p>";
}
