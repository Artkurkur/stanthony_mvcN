<?php

class EventAttendance
{
    private $conn;
    private $table = 'event_attendance';

    public $attendance_id;
    public $event_id;
    public $member_id;
    public $datetime_recorded;
    public $status;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $query = "SELECT ea.*, e.event_name, a.full_name
                  FROM {$this->table} ea
                  LEFT JOIN events e ON ea.event_id = e.event_id
                  LEFT JOIN alumni a ON ea.member_id = a.member_id
                  ORDER BY ea.datetime_recorded DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getByEventId()
    {
        $query = "SELECT ea.*, a.full_name, a.email
                  FROM {$this->table} ea
                  LEFT JOIN alumni a ON ea.member_id = a.member_id
                  WHERE ea.event_id = :event_id
                  ORDER BY ea.datetime_recorded DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->execute();
        return $stmt;
    }

    public function getByMemberId()
    {
        $query = "SELECT ea.*, e.event_name, e.event_date
                  FROM {$this->table} ea
                  LEFT JOIN events e ON ea.event_id = e.event_id
                  WHERE ea.member_id = :member_id
                  ORDER BY ea.datetime_recorded DESC";
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
                      status = :status";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->bindParam(':member_id', $this->member_id);
        $stmt->bindParam(':status', $this->status);

        return $stmt->execute();
    }

    public function update()
    {
        $query = "UPDATE {$this->table}
                  SET status = :status
                  WHERE attendance_id = :attendance_id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':attendance_id', $this->attendance_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $query = "DELETE FROM {$this->table}
                  WHERE attendance_id = :attendance_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':attendance_id', $this->attendance_id);

        return $stmt->execute();
    }
}
