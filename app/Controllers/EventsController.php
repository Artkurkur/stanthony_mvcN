<?php
namespace App\Controllers;

use App\Services\LogService;
use App\Services\EventsService;
use App\Middleware\AuthMiddleware; // Added
use App\Core\Response;
use Exception;

class EventsController
{
    private EventsService $service;
    private LogService $logService;

    public function __construct(EventsService $service, LogService $logService)
    {
        $this->service = $service;
        $this->logService = $logService;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllEvents();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch events'], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $event = $this->service->getEventById($id);
            $event
                ? Response::json($event, 200)
                : Response::json(['error' => 'Event not found'], 404);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function getByBatchYear($params)
    {
        $year = (int) ($params['year'] ?? 0);
        try {
            $data = $this->service->getEventsByBatchYear($year);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function getByStatus($params)
    {
        $status = $params['status'] ?? '';
        try {
            $data = $this->service->getEventsByStatus($status);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $this->service->createEvent($data);

            // Log Action
            $auth = new AuthMiddleware();
            $user = $auth->getCurrentUser();
            $userId = $user['member_id'] ?? null;
            $eventName = $data['event_name'] ?? 'Unknown Event';

            $this->logService->logAction($userId, 'create_event', "Created Event: $eventName (ID: $id)");

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
            $this->service->updateEvent($id, $data);

            // Log Action
            $auth = new AuthMiddleware();
            $user = $auth->getCurrentUser();
            $userId = $user['member_id'] ?? null;

            $this->logService->logAction($userId, 'update_event', "Updated Event ID: $id");

            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deleteEvent($id);

            // Log Action
            $auth = new AuthMiddleware();
            $user = $auth->getCurrentUser();
            $userId = $user['member_id'] ?? null;

            $this->logService->logAction($userId, 'delete_event', "Deleted Event ID: $id");

            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function getAttendees($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getEventAttendees($id);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
