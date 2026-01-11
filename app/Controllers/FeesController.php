<?php
namespace App\Controllers;

use App\Services\FeesService;
use App\Core\Response;
use Exception;

class FeesController
{
    private FeesService $service;

    public function __construct(FeesService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            $data = $this->service->getAllFees();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch fees'], 500);
        }
    }

    public function getActive()
    {
        try {
            $data = $this->service->getActiveFees();
            Response::json($data, 200);
        } catch (Exception $e) {
            Response::json(['error' => 'Unable to fetch active fees'], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $fee = $this->service->getFeeById($id);
            $fee
                ? Response::json($fee, 200)
                : Response::json(['error' => 'Not found'], 404);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->service->createFee($data);
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
            $this->service->updateFee($id, $data);
            Response::json(['message' => 'Updated successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);
        try {
            $this->service->deleteFee($id);
            Response::json(['message' => 'Deleted successfully'], 200);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }
}
