<?php
namespace App\Services;

use App\Repositories\EventTypesRepository;
use Exception;

class EventTypesService
{
    private EventTypesRepository $repository;

    public function __construct(EventTypesRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllEventTypes()
    {
        return $this->repository->getAllEventTypes();
    }

    public function getEventTypeById($id)
    {
        return $this->repository->getEventTypeById($id);
    }

    public function createEventType($data)
    {
        if (empty($data['type_name'])) {
            throw new Exception('Type name is required');
        }
        return $this->repository->createEventType($data);
    }

    public function updateEventType($id, $data)
    {
        if (empty($data['type_name'])) {
            throw new Exception('Type name is required');
        }

        if (!$this->repository->getEventTypeById($id)) {
            throw new Exception('Event type not found');
        }

        return $this->repository->updateEventType($id, $data);
    }

    public function deleteEventType($id)
    {
        if (!$this->repository->getEventTypeById($id)) {
            throw new Exception('Event type not found');
        }
        return $this->repository->deleteEventType($id);
    }
}
