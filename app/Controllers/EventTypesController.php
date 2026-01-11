<?php
namespace App\Controllers;

use App\Services\EventTypesService;
use App\Core\Response;
use Exception;

class EventTypesController
{
    private EventTypesService $service;

    public function __construct(EventTypesService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllEventTypes();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch event types'], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getEventTypeById($id);
            $data
                ? Response::json($data, 200)
                : Response::json(['error' => 'Event type not found'], 404);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch event type'], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->createEventType($data);
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
            $this->service->updateEventType($id, $data);
            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deleteEventType($id);
            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
