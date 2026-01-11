<?php
namespace App\Services;

use App\Repositories\FeesRepository;
use Exception;

class FeesService
{
    private FeesRepository $repository;

    public function __construct(FeesRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllFees()
    {
        return $this->repository->getAllFees();
    }

    public function getActiveFees()
    {
        return $this->repository->getActiveFees();
    }

    public function getFeeById($id)
    {
        return $this->repository->getFeeById($id);
    }

    public function createFee($data)
    {
        if (empty($data['fee_name']) || !isset($data['amount'])) {
            throw new Exception('Fee name and amount are required');
        }

        return $this->repository->createFee($data);
    }

    public function updateFee($id, $data)
    {
        if (!$this->repository->getFeeById($id)) {
            throw new Exception('Fee not found');
        }

        return $this->repository->updateFee($id, $data);
    }

    public function deleteFee($id)
    {
        return $this->repository->deleteFee($id);
    }
}
