<?php
namespace App\Services;

use App\Repositories\RsvpRepository;
use Exception;

class RsvpService
{
    private RsvpRepository $repository;

    public function __construct(RsvpRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllRsvps()
    {
        return $this->repository->getAllRsvps();
    }

    public function getRsvpsByEventId($event_id)
    {
        return $this->repository->getRsvpsByEventId($event_id);
    }

    public function getRsvpsByMemberId($member_id)
    {
        return $this->repository->getRsvpsByMemberId($member_id);
    }

    public function createRsvp($data)
    {
        if (empty($data['event_id']) || empty($data['member_id']) || empty($data['response'])) {
            throw new Exception('Event ID, Member ID, and response are required');
        }

        return $this->repository->createRsvp($data);
    }

    public function updateRsvp($id, $data)
    {
        if (empty($data['response'])) {
            throw new Exception('Response is required');
        }

        return $this->repository->updateRsvp($id, $data);
    }

    public function deleteRsvp($id)
    {
        return $this->repository->deleteRsvp($id);
    }
}
