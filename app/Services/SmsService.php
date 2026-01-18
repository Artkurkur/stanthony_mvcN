<?php
namespace App\Services;

class SmsService
{
    private string $baseUrl;

    // Default to the forwarded port 8080
    public function __construct($baseUrl = 'http://127.0.0.1:8080')
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Send an SMS message
     * 
     * @param string $phoneNumber Recipient number
     * @param string $message Message content
     * @return array Response from the gateway
     */
    /**
     * Send an SMS message using Simple SMS Gateway (Pabrik Aplikasi)
     * Endpoint: /send-sms
     * Method: POST
     * Payload: JSON {"phone": "...", "message": "..."}
     */
    public function send($phoneNumber, $message)
    {
        $url = $this->baseUrl . '/send-sms';

        $data = [
            'phone' => $phoneNumber,
            'message' => $message
        ];

        $jsonData = json_encode($data);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($jsonData)
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'status' => $httpCode,
            'response' => $response,
            'url' => $url
        ];
    }
}
