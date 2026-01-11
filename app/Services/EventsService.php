<?php
namespace App\Services;

use App\Repositories\EventsRepository;
use Exception;

class EventsService
{
    private EventsRepository $repository;

    public function __construct(EventsRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllEvents()
    {
        return $this->repository->getAllEvents();
    }

    public function getEventById($id)
    {
        return $this->repository->getEventById($id);
    }

    public function getEventsByBatchYear($batch_year)
    {
        return $this->repository->getEventsByBatchYear($batch_year);
    }

    public function getEventsByStatus($status)
    {
        return $this->repository->getEventsByStatus($status);
    }

    public function createEvent($data)
    {
        if (empty($data['event_name']) || empty($data['batch_year'])) {
            throw new Exception('Event name and batch year are required');
        }

        $data['status'] = $data['status'] ?? 'upcoming';
        $data['current_amount'] = $data['current_amount'] ?? 0;
        $data['target_amount'] = $data['target_amount'] ?? 0;

        return $this->repository->createEvent($data);
    }

    public function updateEvent($id, $data)
    {
        if (!$this->repository->getEventById($id)) {
            throw new Exception('Event not found');
        }

        return $this->repository->updateEvent($id, $data);
    }

    public function deleteEvent($id)
    {
        if (!$this->repository->getEventById($id)) {
            throw new Exception('Event not found');
        }

        return $this->repository->deleteEvent($id);
    }

    public function getEventAttendees($id)
    {
        return $this->repository->getPotentialAttendees($id);
    }
}
