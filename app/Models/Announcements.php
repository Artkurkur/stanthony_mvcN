<?php

class Announcements
{
    private $conn;
    private $table = 'announcements';

    public $announcement_id;
    public $event_id;
    public $title;
    public $message;
    public $date_posted;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getAll()
    {
        $query = "SELECT a.*, e.event_name
                  FROM {$this->table} a
                  LEFT JOIN events e ON a.event_id = e.event_id
                  ORDER BY a.date_posted DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById()
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE announcement_id = :announcement_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':announcement_id', $this->announcement_id);
        $stmt->execute();
        return $stmt;
    }

    public function getByEventId()
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE event_id = :event_id
                  ORDER BY date_posted DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $query = "INSERT INTO {$this->table}
                  SET event_id = :event_id,
                      title = :title,
                      message = :message";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':message', $this->message);

        return $stmt->execute();
    }

    public function update()
    {
        $query = "UPDATE {$this->table}
                  SET event_id = :event_id,
                      title = :title,
                      message = :message
                  WHERE announcement_id = :announcement_id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':event_id', $this->event_id);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':message', $this->message);
        $stmt->bindParam(':announcement_id', $this->announcement_id);

        return $stmt->execute();
    }

    public function delete()
    {
        $query = "DELETE FROM {$this->table}
                  WHERE announcement_id = :announcement_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':announcement_id', $this->announcement_id);

        return $stmt->execute();
    }
}
