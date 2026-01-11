<?php
namespace App\Repositories;

use PDO;
use PDOException;

class EventTypesRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllEventTypes(): array
    {
        $stmt = $this->db->query("SELECT * FROM event_types ORDER BY type_name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEventTypeById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM event_types WHERE event_type_id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function createEventType(array $data): bool
    {
        $stmt = $this->db->prepare("INSERT INTO event_types (type_name) VALUES (:type_name)");
        return $stmt->execute([':type_name' => $data['type_name']]);
    }

    public function updateEventType($id, array $data): bool
    {
        $stmt = $this->db->prepare("UPDATE event_types SET type_name = :type_name WHERE event_type_id = :id");
        return $stmt->execute([
            ':type_name' => $data['type_name'],
            ':id' => $id
        ]);
    }

    public function deleteEventType($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM event_types WHERE event_type_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
