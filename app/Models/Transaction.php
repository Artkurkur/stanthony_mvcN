<?php

class Transaction
{
    private $conn;
    private $table = 'transaction';

    public $transaction_id;
    public $member_id;
    public $name;
    public $total_amount;
    public $received_by;
    public $receipt_number;
    public $receipt_generated;
    public $receipt_format;
    public $payment_method_id;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        return $this->conn->query(
            "SELECT t.*, a.full_name, a.email
             FROM {$this->table} t
             LEFT JOIN alumni a ON t.member_id = a.member_id
             ORDER BY t.transaction_date DESC"
        );
    }

    public function getById()
    {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE transaction_id = :transaction_id"
        );
        $stmt->bindParam(':transaction_id', $this->transaction_id);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $query = "INSERT INTO {$this->table}
                  SET member_id = :member_id,
                      name = :name,
                      total_amount = :total_amount,
                      received_by = :received_by,
                      receipt_number = :receipt_number,
                      receipt_generated = :receipt_generated,
                      receipt_format = :receipt_format,
                      payment_method_id = :payment_method_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':member_id', $this->member_id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':total_amount', $this->total_amount);
        $stmt->bindParam(':received_by', $this->received_by);
        $stmt->bindParam(':receipt_number', $this->receipt_number);
        $stmt->bindParam(':receipt_generated', $this->receipt_generated);
        $stmt->bindParam(':receipt_format', $this->receipt_format);
        $stmt->bindParam(':payment_method_id', $this->payment_method_id);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getByMemberId()
    {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE member_id = :member_id ORDER BY transaction_date DESC"
        );
        $stmt->bindParam(':member_id', $this->member_id);
        $stmt->execute();
        return $stmt;
    }

    public function update()
    {
        $query = "UPDATE {$this->table}
                  SET member_id = :member_id,
                      name = :name,
                      total_amount = :total_amount,
                      received_by = :received_by,
                      receipt_number = :receipt_number,
                      receipt_generated = :receipt_generated,
                      receipt_format = :receipt_format,
                      payment_method_id = :payment_method_id
                  WHERE transaction_id = :transaction_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':member_id', $this->member_id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':total_amount', $this->total_amount);
        $stmt->bindParam(':received_by', $this->received_by);
        $stmt->bindParam(':receipt_number', $this->receipt_number);
        $stmt->bindParam(':receipt_generated', $this->receipt_generated);
        $stmt->bindParam(':receipt_format', $this->receipt_format);
        $stmt->bindParam(':payment_method_id', $this->payment_method_id);
        $stmt->bindParam(':transaction_id', $this->transaction_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table} WHERE transaction_id = :transaction_id"
        );
        $stmt->bindParam(':transaction_id', $this->transaction_id);
        return $stmt->execute();
    }
}
