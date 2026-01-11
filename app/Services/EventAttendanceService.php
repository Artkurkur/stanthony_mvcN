<?php
namespace App\Services;

use App\Repositories\EventAttendanceRepository;
use Exception;

class EventAttendanceService
{
    private EventAttendanceRepository $repository;

    public function __construct(EventAttendanceRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllAttendance()
    {
        return $this->repository->getAllAttendance();
    }

    public function getAttendanceByEventId($event_id)
    {
        return $this->repository->getAttendanceByEventId($event_id);
    }

    public function getAttendanceByMemberId($member_id)
    {
        return $this->repository->getAttendanceByMemberId($member_id);
    }

    public function createAttendance($data)
    {
        if (empty($data['event_id']) || empty($data['member_id'])) {
            throw new Exception('Event ID and Member ID are required');
        }

        $data['status'] = $data['status'] ?? 'present';
        return $this->repository->createAttendance($data);
    }

    public function updateAttendance($id, $data)
    {
        if (empty($data['status'])) {
            throw new Exception('Status is required');
        }

        return $this->repository->updateAttendance($id, $data);
    }

    public function deleteAttendance($id)
    {
        return $this->repository->deleteAttendance($id);
    }
}
