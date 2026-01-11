<?php

class PaymentMethod
{
    private $conn;
    private $table = 'payment_methods';

    public $payment_method_id;
    public $method_name;
    public $details;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $query = "SELECT * FROM {$this->table} ORDER BY method_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById()
    {
        $query = "SELECT * FROM {$this->table} WHERE payment_method_id = :payment_method_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':payment_method_id', $this->payment_method_id);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $query = "INSERT INTO {$this->table}
                  SET method_name = :method_name,
                      details = :details";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':method_name', $this->method_name);
        $stmt->bindParam(':details', $this->details);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update()
    {
        $query = "UPDATE {$this->table}
                  SET method_name = :method_name,
                      details = :details
                  WHERE payment_method_id = :payment_method_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':method_name', $this->method_name);
        $stmt->bindParam(':details', $this->details);
        $stmt->bindParam(':payment_method_id', $this->payment_method_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $query = "DELETE FROM {$this->table} WHERE payment_method_id = :payment_method_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':payment_method_id', $this->payment_method_id);
        return $stmt->execute();
    }
}
