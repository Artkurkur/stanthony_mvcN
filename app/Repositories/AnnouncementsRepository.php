<?php
namespace App\Repositories;

use PDO;
use PDOException;

class AnnouncementsRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllAnnouncements(): array
    {
        $stmt = $this->db->prepare("
            SELECT a.*, e.event_name
            FROM announcements a
            LEFT JOIN events e ON a.event_id = e.event_id
            ORDER BY a.date_posted DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAnnouncementById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM announcements WHERE announcement_id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getAnnouncementsByEventId($event_id): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM announcements 
            WHERE event_id = :event_id 
            ORDER BY date_posted DESC
        ");
        $stmt->execute([':event_id' => $event_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createAnnouncement(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO announcements (event_id, title, message, category)
            VALUES (:event_id, :title, :message, :category)
        ");
        return $stmt->execute([
            ':event_id' => $data['event_id'] ?? null,
            ':title' => $data['title'],
            ':message' => $data['message'],
            ':category' => $data['category'] ?? null
        ]);
    }

    public function updateAnnouncement($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE announcements
            SET event_id = :event_id,
                title = :title,
                message = :message,
                category = :category
            WHERE announcement_id = :id
        ");
        return $stmt->execute([
            ':event_id' => $data['event_id'] ?? null,
            ':title' => $data['title'],
            ':message' => $data['message'],
            ':category' => $data['category'] ?? null,
            ':id' => $id
        ]);
    }

    public function deleteAnnouncement($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM announcements WHERE announcement_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
