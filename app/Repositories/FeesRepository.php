<?php
namespace App\Repositories;

use PDO;
use PDOException;

class FeesRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllFees(): array
    {
        $stmt = $this->db->query("SELECT * FROM fees");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActiveFees(): array
    {
        $stmt = $this->db->query("SELECT * FROM fees WHERE is_active = 1");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFeeById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM fees WHERE fee_id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function createFee(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO fees (fee_name, amount, is_active)
            VALUES (:fee_name, :amount, :is_active)
        ");
        return $stmt->execute([
            ':fee_name' => $data['fee_name'],
            ':amount' => $data['amount'],
            ':is_active' => $data['is_active']
        ]);
    }

    public function updateFee($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE fees
            SET fee_name = :fee_name,
                amount = :amount,
                is_active = :is_active
            WHERE fee_id = :id
        ");
        return $stmt->execute([
            ':fee_name' => $data['fee_name'],
            ':amount' => $data['amount'],
            ':is_active' => $data['is_active'],
            ':id' => $id
        ]);
    }

    public function deleteFee($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM fees WHERE fee_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
