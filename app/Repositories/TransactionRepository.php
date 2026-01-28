<?php
namespace App\Repositories;

use PDO;
use PDOException;

class TransactionRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllTransactions(): array
    {
        $stmt = $this->db->prepare("
            SELECT 
                t.*, 
                CONCAT(a.fname, ' ', a.lname) as full_name, 
                a.username, 
                a.batch_year,
                pm.method_name,
                f.fee_name,
                e.event_name
            FROM transaction t
            LEFT JOIN alumni a ON t.member_id = a.member_id
            LEFT JOIN payment_method pm ON t.payment_method_id = pm.payment_method_id
            LEFT JOIN transaction_details td ON t.transaction_id = td.transaction_id
            LEFT JOIN fees f ON td.fee_id = f.fee_id
            LEFT JOIN events e ON t.event_id = e.event_id
            ORDER BY t.transaction_date DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTransactionById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM transaction WHERE transaction_id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getTransactionsByMemberId($member_id): array
    {
        $stmt = $this->db->prepare("SELECT * FROM transaction WHERE member_id = :member_id ORDER BY transaction_date DESC");
        $stmt->execute([':member_id' => $member_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createTransaction(array $data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO transaction (member_id, name, transaction_type, transaction_category, event_id, total_amount, received_by, receipt_number, receipt_generated, receipt_format, payment_method_id)
            VALUES (:member_id, :name, :transaction_type, :transaction_category, :event_id, :total_amount, :received_by, :receipt_number, :receipt_generated, :receipt_format, :payment_method_id)
        ");

        $stmt->execute([
            ':member_id' => $data['member_id'],
            ':name' => $data['name'],
            ':transaction_type' => $data['transaction_type'] ?? 'donation', // Default to donation
            ':transaction_category' => $data['transaction_category'] ?? null,
            ':event_id' => $data['event_id'] ?? null,
            ':total_amount' => $data['total_amount'],
            ':received_by' => $data['received_by'] ?? null,
            ':receipt_number' => $data['receipt_number'] ?? null,
            ':receipt_generated' => $data['receipt_generated'] ?? 0,
            ':receipt_format' => $data['receipt_format'] ?? 'pdf',
            ':payment_method_id' => $data['payment_method_id'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function updateTransaction($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE transaction
            SET member_id = :member_id,
                name = :name,
                transaction_type = :transaction_type,
                transaction_category = :transaction_category,
                event_id = :event_id,
                total_amount = :total_amount,
                received_by = :received_by,
                receipt_number = :receipt_number,
                receipt_generated = :receipt_generated,
                receipt_format = :receipt_format,
                payment_method_id = :payment_method_id
            WHERE transaction_id = :id
        ");

        return $stmt->execute([
            ':member_id' => $data['member_id'],
            ':name' => $data['name'],
            ':transaction_type' => $data['transaction_type'] ?? 'donation',
            ':transaction_category' => $data['transaction_category'] ?? null,
            ':event_id' => $data['event_id'] ?? null,
            ':total_amount' => $data['total_amount'],
            ':received_by' => $data['received_by'] ?? null,
            ':receipt_number' => $data['receipt_number'] ?? null,
            ':receipt_generated' => $data['receipt_generated'] ?? 0,
            ':receipt_format' => $data['receipt_format'] ?? 'pdf',
            ':payment_method_id' => $data['payment_method_id'] ?? null,
            ':id' => $id
        ]);
    }

    public function deleteTransaction($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM transaction WHERE transaction_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function updateReceiptUrl($id, $url): bool
    {
        $stmt = $this->db->prepare("UPDATE transaction SET receipt_url = :url WHERE transaction_id = :id");
        return $stmt->execute([':url' => $url, ':id' => $id]);
    }

    public function updateReceiptNumber($id, $number): bool
    {
        $stmt = $this->db->prepare("UPDATE transaction SET receipt_number = :number WHERE transaction_id = :id");
        return $stmt->execute([':number' => $number, ':id' => $id]);
    }
}
