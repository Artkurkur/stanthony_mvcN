<?php
namespace App\Controllers;

use App\Services\PaymentMethodService;
use App\Core\Response;
use Exception;

class PaymentMethodController
{
    private PaymentMethodService $service;

    public function __construct(PaymentMethodService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllPaymentMethods();
            Response::json([
                'data' => $data,
                'message' => 'Payment methods retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = $this->service->getPaymentMethodById($id);
            $data
                ? Response::json($data, 200)
                : Response::json(['error' => 'Payment method not found'], 404);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $this->service->createPaymentMethod($data);
            Response::json(['id' => $id, 'message' => 'Created successfully'], 201);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function update($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->updatePaymentMethod($id, $data);
            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deletePaymentMethod($id);
            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
