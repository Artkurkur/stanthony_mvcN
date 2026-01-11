<?php
namespace App\Repositories;

use PDO;
use PDOException;

class RsvpRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllRsvps(): array
    {
        $stmt = $this->db->prepare("
            SELECT r.*, e.event_name, CONCAT(a.fname, ' ', a.lname) as full_name
            FROM rsvp r
            LEFT JOIN events e ON r.event_id = e.event_id
            LEFT JOIN alumni a ON r.member_id = a.member_id
            ORDER BY r.responded_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRsvpsByEventId($event_id): array
    {
        $stmt = $this->db->prepare("
            SELECT r.*, CONCAT(a.fname, ' ', a.lname) as full_name, a.username, a.batch_year, a.profile_picture, ea.status as attendance_status
            FROM rsvp r
            LEFT JOIN alumni a ON r.member_id = a.member_id
            LEFT JOIN event_attendance ea ON r.event_id = ea.event_id AND r.member_id = ea.member_id
            WHERE r.event_id = :event_id
        ");
        $stmt->execute([':event_id' => $event_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRsvpsByMemberId($member_id): array
    {
        $stmt = $this->db->prepare("
            SELECT r.*, e.event_name, e.event_date
            FROM rsvp r
            LEFT JOIN events e ON r.event_id = e.event_id
            WHERE r.member_id = :member_id
        ");
        $stmt->execute([':member_id' => $member_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createRsvp(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO rsvp (event_id, member_id, response, remarks)
            VALUES (:event_id, :member_id, :response, :remarks)
        ");
        return $stmt->execute([
            ':event_id' => $data['event_id'],
            ':member_id' => $data['member_id'],
            ':response' => $data['response'],
            ':remarks' => $data['remarks'] ?? null
        ]);
    }

    public function updateRsvp($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE rsvp
            SET response = :response,
                remarks = :remarks
            WHERE rsvp_id = :id
        ");
        return $stmt->execute([
            ':response' => $data['response'],
            ':remarks' => $data['remarks'] ?? null,
            ':id' => $id
        ]);
    }

    public function deleteRsvp($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM rsvp WHERE rsvp_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
