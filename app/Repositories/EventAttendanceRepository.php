<?php
namespace App\Repositories;

use PDO;
use PDOException;

class EventAttendanceRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllAttendance(): array
    {
        $stmt = $this->db->prepare("
            SELECT ea.*, e.event_name, CONCAT(a.fname, ' ', a.lname) as full_name
            FROM event_attendance ea
            LEFT JOIN events e ON ea.event_id = e.event_id
            LEFT JOIN alumni a ON ea.member_id = a.member_id
            ORDER BY ea.datetime_recorded DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAttendanceByEventId($event_id): array
    {
        $stmt = $this->db->prepare("
            SELECT ea.*, CONCAT(a.fname, ' ', a.lname) as full_name, a.username, a.batch_year
            FROM event_attendance ea
            LEFT JOIN alumni a ON ea.member_id = a.member_id
            WHERE ea.event_id = :event_id
            ORDER BY ea.datetime_recorded DESC
        ");
        $stmt->execute([':event_id' => $event_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAttendanceByMemberId($member_id): array
    {
        $stmt = $this->db->prepare("
            SELECT ea.*, e.event_name, e.event_date
            FROM event_attendance ea
            LEFT JOIN events e ON ea.event_id = e.event_id
            WHERE ea.member_id = :member_id
            ORDER BY ea.datetime_recorded DESC
        ");
        $stmt->execute([':member_id' => $member_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createAttendance(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO event_attendance (event_id, member_id, status)
            VALUES (:event_id, :member_id, :status)
        ");
        return $stmt->execute([
            ':event_id' => $data['event_id'],
            ':member_id' => $data['member_id'],
            ':status' => $data['status'] ?? 'present'
        ]);
    }

    public function updateAttendance($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE event_attendance
            SET status = :status
            WHERE attendance_id = :attendance_id
        ");
        return $stmt->execute([
            ':status' => $data['status'],
            ':attendance_id' => $id
        ]);
    }

    public function deleteAttendance($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM event_attendance WHERE attendance_id = :attendance_id");
        return $stmt->execute([':attendance_id' => $id]);
    }
}
