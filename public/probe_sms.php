<?php
// Probe script to find the correct endpoint

$baseUrl = 'http://127.0.0.1:8080';
$endpoints = [
    '/' => ['method' => 'GET'],
    '/send' => ['method' => 'GET', 'params' => '?phone=0000000000&text=test'],
    '/sendsms' => ['method' => 'GET', 'params' => '?phone=0000000000&text=test'],
    '/sms/send' => ['method' => 'POST', 'body' => ['phone' => '0000000000', 'message' => 'test']],
    '/v1/sms/send' => ['method' => 'POST', 'body' => ['phone' => '0000000000', 'message' => 'test']],
    '/api/send' => ['method' => 'POST', 'body' => ['to' => '0000000000', 'message' => 'test']],
    '/message/send' => ['method' => 'POST', 'body' => ['to' => '0000000000', 'text' => 'test']],
];

echo "Probing endpoints at $baseUrl\n";

foreach ($endpoints as $path => $config) {
    $url = $baseUrl . $path . ($config['params'] ?? '');
    echo "Testing $url matching [{$config['method']}] ... ";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);

    if ($config['method'] === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if (isset($config['body'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($config['body']));
        }
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Status: $httpCode\n";
    if ($response) {
        echo "Response: " . substr(strip_tags($response), 0, 200) . "\n";
    }
}
