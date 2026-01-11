<?php
namespace App\Repositories;

use PDO;
use PDOException;

class PaymentMethodRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllPaymentMethods(): array
    {
        $stmt = $this->db->query("SELECT * FROM payment_method ORDER BY method_name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPaymentMethodById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM payment_method WHERE payment_method_id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function createPaymentMethod(array $data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO payment_method (method_name, details)
            VALUES (:method_name, :details)
        ");
        $stmt->execute([
            ':method_name' => $data['method_name'],
            ':details' => $data['details'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function updatePaymentMethod($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE payment_method
            SET method_name = :method_name,
                details = :details
            WHERE payment_method_id = :id
        ");
        return $stmt->execute([
            ':method_name' => $data['method_name'],
            ':details' => $data['details'] ?? null,
            ':id' => $id
        ]);
    }

    public function deletePaymentMethod($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM payment_method WHERE payment_method_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
