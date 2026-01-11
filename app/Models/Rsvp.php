<?php

class Rsvp
{
    private $conn;
    private $table = 'rsvp';

    public $rsvp_id;
    public $event_id;
    public $member_id;
    public $response;
    public $remarks;
    public $responded_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $query = "SELECT r.*, e.event_name, a.full_name
                  FROM {$this->table} r
                  LEFT JOIN events e ON r.event_id = e.event_id
                  LEFT JOIN alumni a ON r.member_id = a.member_id
                  ORDER BY r.responded_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getByEventId()
    {
        $query = "SELECT r.*, a.full_name, a.email
                  FROM {$this->table} r
                  LEFT JOIN alumni a ON r.member_id = a.member_id
                  WHERE r.event_id = :event_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->execute();
        return $stmt;
    }

    public function getByMemberId()
    {
        $query = "SELECT r.*, e.event_name, e.event_date
                  FROM {$this->table} r
                  LEFT JOIN events e ON r.event_id = e.event_id
                  WHERE r.member_id = :member_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':member_id', $this->member_id);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $query = "INSERT INTO {$this->table}
                  SET event_id = :event_id,
                      member_id = :member_id,
                      response = :response,
                      remarks = :remarks";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->bindParam(':member_id', $this->member_id);
        $stmt->bindParam(':response', $this->response);
        $stmt->bindParam(':remarks', $this->remarks);

        return $stmt->execute();
    }

    public function update()
    {
        $query = "UPDATE {$this->table}
                  SET response = :response,
                      remarks = :remarks
                  WHERE rsvp_id = :rsvp_id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':response', $this->response);
        $stmt->bindParam(':remarks', $this->remarks);
        $stmt->bindParam(':rsvp_id', $this->rsvp_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $query = "DELETE FROM {$this->table}
                  WHERE rsvp_id = :rsvp_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':rsvp_id', $this->rsvp_id);

        return $stmt->execute();
    }
}
