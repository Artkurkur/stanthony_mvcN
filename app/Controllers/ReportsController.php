<?php

namespace App\Controllers;

use App\Services\ReportService;
use App\Core\Response;
use Exception;

class ReportsController
{
    private $service;

    public function __construct(ReportService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            $data = $this->service->getDonationOverview();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }
}
