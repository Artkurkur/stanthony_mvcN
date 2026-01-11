<?php
namespace App\Repositories;

use PDO;
use PDOException;

class NotificationsRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // Get notifications for a specific user
    public function getByMemberId($member_id): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM notifications 
            WHERE member_id = :member_id 
            ORDER BY created_at DESC
        ");
        $stmt->execute([':member_id' => $member_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create a new notification
    public function create(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (member_id, title, message, type, created_at, is_read)
            VALUES (:member_id, :title, :message, :type, NOW(), 0)
        ");
        return $stmt->execute([
            ':member_id' => $data['member_id'],
            ':title' => $data['title'],
            ':message' => $data['message'],
            ':type' => $data['type'] ?? 'info'
        ]);
    }

    // Mark notification as read
    public function markAsRead($id): bool
    {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // Delete notification
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // Get aggregated sent notifications (history)
    public function getDistinctNotifications(): array
    {
        // Group by title and message to see what was sent in bulk
        // Also counting recipients
        $sql = "
            SELECT 
                MIN(id) as id,
                title, 
                message, 
                type, 
                MAX(created_at) as created_at, 
                COUNT(*) as recipient_count
            FROM notifications
            GROUP BY title, message, type
            ORDER BY created_at DESC
        ";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Delete a group of notifications by content (Admin deleting history)
    public function deleteGroupByContent($title, $message, $type): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM notifications 
            WHERE title = :title AND message = :message AND type = :type
        ");
        return $stmt->execute([
            ':title' => $title,
            ':message' => $message,
            ':type' => $type
        ]);
    }
}
