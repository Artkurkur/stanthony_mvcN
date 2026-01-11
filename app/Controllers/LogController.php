<?php

namespace App\Controllers;

use App\Services\LogService;
use App\Core\Response;

class LogController
{
    private $service;

    public function __construct(LogService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            // Optional: Check if user is Admin here or in Router middleware
            // For now, assume authorized if valid token (which is checked in front-end/router usually)

            $logs = $this->service->getAllLogs();
            Response::json($logs, 200);
        } catch (\Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }
}
