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

    public function createTransaction($data, $creatorId = null)
    {
        $memberId = null;
        $fullName = $data['name'] ?? '';


        // Enforce Cashier Name in 'received_by'
        // Always set received_by to the name of the user with Role ID 7 (Cashier)
        $cashier = $this->alumniRepository->findFirstByRole(7);
        if ($cashier) {
            $data['received_by'] = trim($cashier['fname'] . ' ' . $cashier['lname']);
            if (empty($data['received_by'])) {
                $data['received_by'] = $cashier['username'];
            }
        } else {
            // Fallback: If no cashier found, maybe keep existing or set default?
            // "Online" is often used for self-service or maybe just leave what frontend sent if no cashier exists.
            // But per instruction "it's always the cashier", so we try our best.
            if (empty($data['received_by'])) {
                $data['received_by'] = 'Online';
            }
        }

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

        // Create Transaction
        $transactionId = $this->repository->createTransaction($data);

        // Auto-Generate Receipt Number
        // Format: RCP-{Year}-{ID padded to 6 digits}
        // e.g. RCP-2026-000123
        $year = date('Y');
        $paddedId = str_pad($transactionId, 6, '0', STR_PAD_LEFT);
        $generatedReceiptNumber = "RCP-{$year}-{$paddedId}";

        $this->repository->updateReceiptNumber($transactionId, $generatedReceiptNumber);

        // Create Transaction Detail if fee_id is provided
        if (!empty($data['fee_id'])) {
            $this->detailsRepository->createTransactionDetail([
                'transaction_id' => $transactionId,
                'fee_id' => $data['fee_id'],
                'paid_amount' => $data['total_amount'] ?? 0 // Use detailed amount or total
            ]);
        }

        // Handle Receipt Image Upload (Base64)
        if (!empty($data['receipt_image'])) {
            $receiptUrl = $this->saveReceiptImage($transactionId, $data['receipt_image']);
            if ($receiptUrl) {
                $this->repository->updateReceiptUrl($transactionId, $receiptUrl);
            }
        }

        return $transactionId;
    }

    private function saveReceiptImage($transactionId, $base64String)
    {
        // Define path: root/asset/uploads/receipts
        $targetDir = dirname(__DIR__, 2) . '/asset/uploads/receipts/';

        // Relative path for database storing (accessible via browser from views/)
        // Application structure: public/ (views served from here?) vs logic.
        // If the view is in views/SponsorDonation.html, and assets are in ../asset
        // Store the relative path string
        $dbPathPrefix = '../asset/uploads/receipts/';

        // Ensure directory exists
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        // Extract image data
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                return null;
            }

            $base64String = base64_decode($base64String);

            if ($base64String === false) {
                return null;
            }

            // Generate Filename
            $filename = "receipt_{$transactionId}.{$type}";
            $filePath = $targetDir . $filename;

            // Save file
            if (file_put_contents($filePath, $base64String)) {
                return $dbPathPrefix . $filename; // Return the web-accessible path
            }
        }
        return null;
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
