<?php

class Events
{
    private $conn;
    private $table = 'events';

    public $event_id;
    public $event_name;
    public $event_date;
    public $start_time;
    public $end_time;
    public $location;
    public $hosted_by;
    public $description;
    public $status;
    public $current_amount;
    public $target_amount;
    public $contribution_deadline;
    public $created_at;
    public $event_type_id;
    public $batch_year;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $query = "SELECT * FROM {$this->table} ORDER BY event_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById()
    {
        $query = "SELECT * FROM {$this->table} WHERE event_id = :event_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->execute();
        return $stmt;
    }

    public function getByBatchYear()
    {
        $query = "SELECT * FROM {$this->table} WHERE batch_year = :batch_year ORDER BY event_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':batch_year', $this->batch_year);
        $stmt->execute();
        return $stmt;
    }

    public function getByStatus()
    {
        $query = "SELECT * FROM {$this->table} WHERE status = :status ORDER BY event_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $this->status);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $query = "INSERT INTO {$this->table}
                  SET event_name = :event_name,
                      event_date = :event_date,
                      start_time = :start_time,
                      end_time = :end_time,
                      location = :location,
                      hosted_by = :hosted_by,
                      description = :description,
                      status = :status,
                      current_amount = :current_amount,
                      target_amount = :target_amount,
                      contribution_deadline = :contribution_deadline,
                      event_type_id = :event_type_id,
                      batch_year = :batch_year";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':event_name', $this->event_name);
        $stmt->bindParam(':event_date', $this->event_date);
        $stmt->bindParam(':start_time', $this->start_time);
        $stmt->bindParam(':end_time', $this->end_time);
        $stmt->bindParam(':location', $this->location);
        $stmt->bindParam(':hosted_by', $this->hosted_by);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':current_amount', $this->current_amount);
        $stmt->bindParam(':target_amount', $this->target_amount);
        $stmt->bindParam(':contribution_deadline', $this->contribution_deadline);
        $stmt->bindParam(':event_type_id', $this->event_type_id);
        $stmt->bindParam(':batch_year', $this->batch_year);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update()
    {
        $query = "UPDATE {$this->table}
                  SET event_name = :event_name,
                      event_date = :event_date,
                      start_time = :start_time,
                      end_time = :end_time,
                      location = :location,
                      hosted_by = :hosted_by,
                      description = :description,
                      status = :status,
                      current_amount = :current_amount,
                      target_amount = :target_amount,
                      contribution_deadline = :contribution_deadline,
                      event_type_id = :event_type_id,
                      batch_year = :batch_year
                  WHERE event_id = :event_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':event_name', $this->event_name);
        $stmt->bindParam(':event_date', $this->event_date);
        $stmt->bindParam(':start_time', $this->start_time);
        $stmt->bindParam(':end_time', $this->end_time);
        $stmt->bindParam(':location', $this->location);
        $stmt->bindParam(':hosted_by', $this->hosted_by);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':current_amount', $this->current_amount);
        $stmt->bindParam(':target_amount', $this->target_amount);
        $stmt->bindParam(':contribution_deadline', $this->contribution_deadline);
        $stmt->bindParam(':event_type_id', $this->event_type_id);
        $stmt->bindParam(':batch_year', $this->batch_year);
        $stmt->bindParam(':event_id', $this->event_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $query = "DELETE FROM {$this->table} WHERE event_id = :event_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_id', $this->event_id);
        return $stmt->execute();
    }
}
