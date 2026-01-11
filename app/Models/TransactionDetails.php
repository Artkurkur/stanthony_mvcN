<?php

class TransactionDetails
{
    private $conn;
    private $table = 'transaction_details';

    public $transaction_detail_id;
    public $transaction_id;
    public $fee_id;
    public $paid_amount;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getByTransactionId()
    {
        $stmt = $this->conn->prepare(
            "SELECT td.*, f.fee_name, f.amount
             FROM {$this->table} td
             LEFT JOIN fees f ON td.fee_id = f.fee_id
             WHERE td.transaction_id = :transaction_id"
        );
        $stmt->bindParam(':transaction_id', $this->transaction_id);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table}
             SET transaction_id = :transaction_id,
                 fee_id = :fee_id,
                 paid_amount = :paid_amount"
        );

        $stmt->bindParam(':transaction_id', $this->transaction_id);
        $stmt->bindParam(':fee_id', $this->fee_id);
        $stmt->bindParam(':paid_amount', $this->paid_amount);

        return $stmt->execute();
    }

    public function delete()
    {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table}
             WHERE transaction_detail_id = :transaction_detail_id"
        );
        $stmt->bindParam(':transaction_detail_id', $this->transaction_detail_id);
        return $stmt->execute();
    }
}
