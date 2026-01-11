<?php
// app/Models/EventTypes.php

class EventTypes {
    private $conn;
    private $table = 'event_types';

    public $event_type_id;
    public $type_name;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY type_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById() {
        $query = "SELECT * FROM " . $this->table . " WHERE event_type_id = :event_type_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_type_id', $this->event_type_id);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET type_name = :type_name";
        
        $stmt = $this->conn->prepare($query);
        
        $this->type_name = htmlspecialchars(strip_tags($this->type_name));
        
        $stmt->bindParam(':type_name', $this->type_name);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table . " 
                  SET type_name = :type_name 
                  WHERE event_type_id = :event_type_id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->type_name = htmlspecialchars(strip_tags($this->type_name));
        $this->event_type_id = htmlspecialchars(strip_tags($this->event_type_id));
        
        $stmt->bindParam(':type_name', $this->type_name);
        $stmt->bindParam(':event_type_id', $this->event_type_id);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE event_type_id = :event_type_id";
        $stmt = $this->conn->prepare($query);
        
        $this->event_type_id = htmlspecialchars(strip_tags($this->event_type_id));
        $stmt->bindParam(':event_type_id', $this->event_type_id);
        
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}