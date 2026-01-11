<?php
namespace App\Controllers;

use App\Services\LogService;
use App\Services\EventAttendanceService;
use App\Core\Response;
use Exception;

class EventAttendanceController
{
    private EventAttendanceService $service;
    private LogService $logService;

    public function __construct(EventAttendanceService $service, LogService $logService)
    {
        $this->service = $service;
        $this->logService = $logService;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllAttendance();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch attendance'], 500);
        }
    }

    public function getByEventId($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getAttendanceByEventId($id);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function getByMemberId($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getAttendanceByMemberId($id);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->createAttendance($data);

            $this->logService->logAction(null, 'update', "Marked attendance for Member ID: " . ($data['member_id'] ?? 'Unknown'));

            Response::json(['message' => 'Created successfully'], 201);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function update($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->updateAttendance($id, $data);
            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deleteAttendance($id);
            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
