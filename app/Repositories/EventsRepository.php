<?php
namespace App\Repositories;

use PDO;
use PDOException;

class EventsRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getAllEvents(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM events ORDER BY event_date DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEventById($id)
    {
        $stmt = $this->db->prepare("
            SELECT e.*, et.type_name 
            FROM events e 
            LEFT JOIN event_types et ON e.event_type_id = et.event_type_id 
            WHERE e.event_id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getEventsByBatchYear($batch_year): array
    {
        $stmt = $this->db->prepare("SELECT * FROM events WHERE batch_year = :batch_year ORDER BY event_date DESC");
        $stmt->execute([':batch_year' => $batch_year]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEventsByStatus($status): array
    {
        $stmt = $this->db->prepare("SELECT * FROM events WHERE status = :status ORDER BY event_date DESC");
        $stmt->execute([':status' => $status]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createEvent(array $data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO events (event_name, event_date, start_time, end_time, location, hosted_by, description, status, current_amount, target_amount, contribution_deadline, event_type_id, batch_year)
            VALUES (:event_name, :event_date, :start_time, :end_time, :location, :hosted_by, :description, :status, :current_amount, :target_amount, :contribution_deadline, :event_type_id, :batch_year)
        ");

        $stmt->execute([
            ':event_name' => $data['event_name'],
            ':event_date' => $data['event_date'] ?? null,
            ':start_time' => $data['start_time'] ?? null,
            ':end_time' => $data['end_time'] ?? null,
            ':location' => $data['location'] ?? null,
            ':hosted_by' => $data['hosted_by'] ?? null,
            ':description' => $data['description'] ?? null,
            ':status' => $data['status'] ?? 'upcoming',
            ':current_amount' => $data['current_amount'] ?? 0.00,
            ':target_amount' => $data['target_amount'] ?? 0.00,
            ':contribution_deadline' => $data['contribution_deadline'] ?? null,
            ':event_type_id' => $data['event_type_id'] ?? null,
            ':batch_year' => $data['batch_year'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function updateEvent($id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE events
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
            WHERE event_id = :id
        ");

        return $stmt->execute([
            ':event_name' => $data['event_name'],
            ':event_date' => $data['event_date'] ?? null,
            ':start_time' => $data['start_time'] ?? null,
            ':end_time' => $data['end_time'] ?? null,
            ':location' => $data['location'] ?? null,
            ':hosted_by' => $data['hosted_by'] ?? null,
            ':description' => $data['description'] ?? null,
            ':status' => $data['status'] ?? 'upcoming',
            ':current_amount' => $data['current_amount'] ?? 0.00,
            ':target_amount' => $data['target_amount'] ?? 0.00,
            ':contribution_deadline' => $data['contribution_deadline'] ?? null,
            ':event_type_id' => $data['event_type_id'] ?? null,
            ':batch_year' => $data['batch_year'] ?? null,
            ':id' => $id
        ]);
    }

    public function deleteEvent($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM events WHERE event_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function getPotentialAttendees($event_id): array
    {
        // Logic: 
        // 1. If Event has batch_year, get all alumni from that batch.
        // 2. LEFT JOIN event_attendance (ea) for check-in status.
        // 3. LEFT JOIN rsvp (r) for response status.
        // 4. Status priority: Checked-in (ea.status) > RSVP (r.response) > 'Pending'.

        $stmt = $this->db->prepare("
            SELECT a.member_id, a.fname, a.lname, a.batch_year, a.username,
                   COALESCE(ea.status, r.response, 'Pending') as status,
                   CONCAT(a.fname, ' ', a.lname) as full_name
            FROM alumni a
            JOIN events e ON e.event_id = :event_id
            LEFT JOIN event_attendance ea ON a.member_id = ea.member_id AND ea.event_id = :event_id
            LEFT JOIN rsvp r ON a.member_id = r.member_id AND r.event_id = :event_id
            WHERE 
                (e.batch_year IS NOT NULL AND e.batch_year != 0 AND a.batch_year LIKE CONCAT('%', e.batch_year, '%'))
                OR 
                ((e.batch_year IS NULL OR e.batch_year = 0) AND (ea.member_id IS NOT NULL OR r.member_id IS NOT NULL))
            ORDER BY a.lname ASC
        ");
        $stmt->execute([':event_id' => $event_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
