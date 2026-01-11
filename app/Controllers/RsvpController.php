<?php
namespace App\Controllers;

use App\Services\RsvpService;
use App\Core\Response;
use Exception;

class RsvpController
{
    private RsvpService $service;

    public function __construct(RsvpService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllRsvps();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch RSVPs'], 500);
        }
    }

    public function getByEventId($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getRsvpsByEventId($id);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function getByMemberId($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getRsvpsByMemberId($id);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->createRsvp($data);
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
            $this->service->updateRsvp($id, $data);
            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deleteRsvp($id);
            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
