<?php
namespace App\Controllers;

use App\Services\TransactionService;
use App\Services\LogService;
use App\Middleware\AuthMiddleware;
use App\Core\Response;
use Exception;

class TransactionController
{
    private TransactionService $service;
    private LogService $logService;

    public function __construct(TransactionService $service, LogService $logService)
    {
        $this->service = $service;
        $this->logService = $logService;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllTransactions();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch transactions'], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getTransactionById($id);
            $data
                ? Response::json($data, 200)
                : Response::json(['error' => 'Not found'], 404);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function getByMemberId($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getTransactionsByMemberId($id);
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $this->service->createTransaction($data);

            // Log Action
            $auth = new AuthMiddleware();
            $user = $auth->getCurrentUser();
            $userId = $user['member_id'] ?? null;
            $details = "Created Transaction ID: $id" . ($userId ? " by user $userId" : " (Guest)");

            $this->logService->logAction($userId, 'create_transaction', $details);

            Response::json(['transaction_id' => $id, 'message' => 'Created'], 201);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function update($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->updateTransaction($id, $data);

            // Log Action
            $auth = new AuthMiddleware();
            $user = $auth->getCurrentUser();
            $userId = $user['member_id'] ?? null;

            $this->logService->logAction($userId, 'update_transaction', "Updated Transaction ID: $id");

            Response::json(['message' => 'Updated'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deleteTransaction($id);

            // Log Action
            $auth = new AuthMiddleware();
            $user = $auth->getCurrentUser();
            $userId = $user['member_id'] ?? null;

            $this->logService->logAction($userId, 'delete_transaction', "Deleted Transaction ID: $id");

            Response::json(['message' => 'Deleted'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
