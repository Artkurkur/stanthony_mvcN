<?php
namespace App\Services;

use App\Repositories\TransactionRepository;
use App\Repositories\TransactionDetailsRepository;
use App\Repositories\FeesRepository;
use Exception;

class TransactionService
{
    private TransactionRepository $repository;
    private TransactionDetailsRepository $detailsRepository;
    private FeesRepository $feesRepository;
    private \App\Repositories\AlumniRepository $alumniRepository;

    public function __construct(
        TransactionRepository $repository,
        TransactionDetailsRepository $detailsRepository,
        FeesRepository $feesRepository,
        \App\Repositories\AlumniRepository $alumniRepository
    ) {
        $this->repository = $repository;
        $this->detailsRepository = $detailsRepository;
        $this->feesRepository = $feesRepository;
        $this->alumniRepository = $alumniRepository;
    }

    public function getAllTransactions()
    {
        return $this->repository->getAllTransactions();
    }

    public function getTransactionById($id)
    {
        $transaction = $this->repository->getTransactionById($id);
        if ($transaction) {
            $transaction['details'] =
                $this->detailsRepository->getDetailsByTransactionId($id);
        }
        return $transaction;
    }

    public function createTransaction($data)
    {
        $memberId = null;
        $fullName = $data['name'] ?? '';

        // Handle Alumni Logic
        if (isset($data['user_type']) && $data['user_type'] === 'Alumni') {
            $fname = $data['fname'] ?? '';
            $lname = $data['lname'] ?? '';

            // Verify if alumni exists
            $alumni = $this->alumniRepository->findByName($fname, $lname);

            if ($alumni) {
                // If found, link to member_id and use database name standard
                $memberId = $alumni['member_id'];
                $fullName = $alumni['fname'] . ' ' . $alumni['lname'];
            } else {
                // If not found, fallback to Non-User (member_id is null)
                // Name is constructed from input
                $fullName = $fname . ' ' . $lname;
            }
        }
        // Logic will fall through here for 'Non-User' or failed alumni lookup, keeping memberId as null

        // Overwrite prepared data for repository
        $data['member_id'] = $memberId;
        $data['name'] = $fullName;

        // Validation: Name is always required
        if (empty($data['name'])) {
            throw new Exception('Name is required');
        }

        // Validation: Amount required UNLESS it's GCash (id 2) where it might be 0/hidden
        $paymentMethodId = $data['payment_method_id'] ?? 0;
        if (empty($data['total_amount']) && $paymentMethodId != 2) {
            throw new Exception('Amount is required for this payment method');
        }

        $transactionId = $this->repository->createTransaction($data);

        // Create Transaction Detail if fee_id is provided
        if (!empty($data['fee_id'])) {
            $this->detailsRepository->createTransactionDetail([
                'transaction_id' => $transactionId,
                'fee_id' => $data['fee_id'],
                'paid_amount' => $data['total_amount'] ?? 0 // Use detailed amount or total
            ]);
        }

        return $transactionId;
    }

    public function getTransactionsByMemberId($member_id)
    {
        return $this->repository->getTransactionsByMemberId($member_id);
    }

    public function updateTransaction($id, $data)
    {
        return $this->repository->updateTransaction($id, $data);
    }

    public function deleteTransaction($id)
    {
        return $this->repository->deleteTransaction($id);
    }
}
