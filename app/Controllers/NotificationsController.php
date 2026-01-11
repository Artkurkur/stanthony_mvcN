<?php
namespace App\Controllers;

use App\Services\NotificationsService;
use App\Core\Response;
use App\Middleware\AuthMiddleware; // Assuming we can use this or implement logic inside
use Exception;

class NotificationsController
{
    private NotificationsService $service;

    public function __construct(NotificationsService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $middleware = new AuthMiddleware();
        $user = $middleware->verifyToken();

        if (!$user) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        try {
            if ($user['role_id'] == 1) { // 1 = Admin
                $mode = $_GET['mode'] ?? 'feed';
                if ($mode === 'feed') {
                    $data = $this->service->getAdminFeed();
                } elseif ($mode === 'sent') {
                    $data = $this->service->getSentHistory();
                } else {
                    $data = $this->service->getUserNotifications($user['member_id']);
                }
            } else {
                // Member
                $data = $this->service->getUserNotifications($user['member_id']);
            }
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        $middleware = new AuthMiddleware();
        $user = $middleware->verifyToken();

        if (!$user || $user['role_id'] != 1) {
            Response::json(['error' => 'Unauthorized'], 403);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $result = $this->service->forwardNotification($data);
            Response::json(['message' => 'Notifications sent', 'details' => $result], 201);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroyGroup()
    {
        $middleware = new AuthMiddleware();
        $user = $middleware->verifyToken();

        if (!$user || $user['role_id'] != 1) {
            Response::json(['error' => 'Unauthorized'], 403);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['title']) || !isset($data['message'])) {
                Response::json(['error' => 'Missing fields'], 400);
                return;
            }

            $this->service->deleteSentGroup($data);
            Response::json(['message' => 'Group deleted'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $middleware = new AuthMiddleware();
        $user = $middleware->verifyToken();

        if (!$user) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        $id = (int) ($params['id'] ?? 0);
        try {
            // Ideally check if notification belongs to user, but for now just auth check
            $this->service->deleteNotification($id);
            Response::json(['message' => 'Deleted'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
