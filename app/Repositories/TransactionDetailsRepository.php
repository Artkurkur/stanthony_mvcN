<?php
namespace App\Repositories;

use PDO;
use PDOException;

class TransactionDetailsRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getDetailsByTransactionId($transaction_id): array
    {
        $stmt = $this->db->prepare("
             SELECT td.*, f.fee_name, f.amount
             FROM transaction_details td
             LEFT JOIN fees f ON td.fee_id = f.fee_id
             WHERE td.transaction_id = :transaction_id
        ");
        $stmt->execute([':transaction_id' => $transaction_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createTransactionDetail(array $data): bool
    {
        $stmt = $this->db->prepare("
             INSERT INTO transaction_details (transaction_id, fee_id, paid_amount)
             VALUES (:transaction_id, :fee_id, :paid_amount)
        ");
        return $stmt->execute([
            ':transaction_id' => $data['transaction_id'],
            ':fee_id' => $data['fee_id'],
            ':paid_amount' => $data['paid_amount']
        ]);
    }

    public function deleteTransactionDetail($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM transaction_details WHERE transaction_detail_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
