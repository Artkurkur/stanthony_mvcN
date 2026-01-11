<?php
namespace App\Services;

use App\Repositories\PaymentMethodRepository;
use Exception;

class PaymentMethodService
{
    private PaymentMethodRepository $repository;

    public function __construct(PaymentMethodRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllPaymentMethods()
    {
        return $this->repository->getAllPaymentMethods();
    }

    public function getPaymentMethodById($id)
    {
        return $this->repository->getPaymentMethodById($id);
    }

    public function createPaymentMethod($data)
    {
        if (empty($data['method_name'])) {
            throw new Exception('Method name is required');
        }
        return $this->repository->createPaymentMethod($data);
    }

    public function updatePaymentMethod($id, $data)
    {
        if (empty($data['method_name'])) {
            throw new Exception('Method name is required');
        }
        return $this->repository->updatePaymentMethod($id, $data);
    }

    public function deletePaymentMethod($id)
    {
        return $this->repository->deletePaymentMethod($id);
    }
}
