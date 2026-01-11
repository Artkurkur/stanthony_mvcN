<?php
namespace App\Controllers;

use App\Services\LogService;
use App\Services\AnnouncementsService;
use App\Core\Response;
use Exception;

class AnnouncementsController
{
    private AnnouncementsService $service;
    private LogService $logService;

    public function __construct(AnnouncementsService $service, LogService $logService)
    {
        $this->service = $service;
        $this->logService = $logService;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllAnnouncements();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch announcements'], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);

        try {
            $data = $this->service->getAnnouncementById($id);
            $data
                ? Response::json($data, 200)
                : Response::json(['error' => 'Not found'], 404);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->createAnnouncement($data);

            $this->logService->logAction(null, 'create', "Created Announcement: " . ($data['title'] ?? 'Unknown'));

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
            $this->service->updateAnnouncement($id, $data);
            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);

        try {
            $this->service->deleteAnnouncement($id);
            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }
}
