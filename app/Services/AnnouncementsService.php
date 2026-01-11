<?php
namespace App\Services;

use App\Repositories\AnnouncementsRepository;
use Exception;

class AnnouncementsService
{
    private AnnouncementsRepository $repository;

    public function __construct(AnnouncementsRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllAnnouncements()
    {
        return $this->repository->getAllAnnouncements();
    }

    public function getAnnouncementById($id)
    {
        return $this->repository->getAnnouncementById($id);
    }

    public function getAnnouncementsByEventId($event_id)
    {
        return $this->repository->getAnnouncementsByEventId($event_id);
    }

    public function createAnnouncement($data)
    {
        if (empty($data['title']) || empty($data['message'])) {
            throw new Exception('Title and message are required');
        }

        return $this->repository->createAnnouncement($data);
    }

    public function updateAnnouncement($id, $data)
    {
        if (!$this->repository->getAnnouncementById($id)) {
            throw new Exception('Announcement not found');
        }

        return $this->repository->updateAnnouncement($id, $data);
    }

    public function deleteAnnouncement($id)
    {
        return $this->repository->deleteAnnouncement($id);
    }
}
