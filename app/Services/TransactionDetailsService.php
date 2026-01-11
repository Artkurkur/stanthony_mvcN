<?php

require_once __DIR__ . '/../Repositories/TransactionDetailsRepository.php';

class TransactionDetailsService
{
    private $repository;

    public function __construct()
    {
        $this->repository = new TransactionDetailsRepository();
    }

    public function getDetailsByTransactionId($transaction_id)
    {
        return $this->repository->getDetailsByTransactionId($transaction_id);
    }

    public function createTransactionDetail($data)
    {
        if (empty($data['transaction_id']) || empty($data['fee_id']) || empty($data['paid_amount'])) {
            throw new Exception('Transaction, fee, and amount required');
        }

        return $this->repository->createTransactionDetail($data);
    }

    public function updateTransactionDetail($id, $data)
    {
        return $this->repository->updateTransactionDetail($id, $data);
    }

    public function deleteTransactionDetail($id)
    {
        return $this->repository->deleteTransactionDetail($id);
    }
}
