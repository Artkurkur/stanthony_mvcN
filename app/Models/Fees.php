<?php

class Fees
{
    private $conn;
    private $table = 'fees';

    public $fee_id;
    public $fee_name;
    public $amount;
    public $is_active;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        return $this->conn->query("SELECT * FROM {$this->table}");
    }

    public function getActive()
    {
        return $this->conn->query("SELECT * FROM {$this->table} WHERE is_active = 1");
    }

    public function getById()
    {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE fee_id = :fee_id"
        );
        $stmt->bindParam(':fee_id', $this->fee_id);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table}
             SET fee_name = :fee_name,
                 amount = :amount,
                 is_active = :is_active"
        );

        $stmt->bindParam(':fee_name', $this->fee_name);
        $stmt->bindParam(':amount', $this->amount);
        $stmt->bindParam(':is_active', $this->is_active);

        return $stmt->execute();
    }

    public function update()
    {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table}
             SET fee_name = :fee_name,
                 amount = :amount,
                 is_active = :is_active
             WHERE fee_id = :fee_id"
        );

        $stmt->bindParam(':fee_name', $this->fee_name);
        $stmt->bindParam(':amount', $this->amount);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':fee_id', $this->fee_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table} WHERE fee_id = :fee_id"
        );
        $stmt->bindParam(':fee_id', $this->fee_id);
        return $stmt->execute();
    }
}
