<?php
namespace App\Services;

use App\Repositories\NotificationsRepository;
use App\Repositories\EventsRepository;
use App\Repositories\AnnouncementsRepository;
use App\Repositories\AlumniRepository;

class NotificationsService
{
    private NotificationsRepository $notificationsRepo;
    private EventsRepository $eventsRepo;
    private AnnouncementsRepository $announcementsRepo;
    private AlumniRepository $alumniRepo;

    public function __construct(
        NotificationsRepository $notificationsRepo,
        EventsRepository $eventsRepo,
        AnnouncementsRepository $announcementsRepo,
        AlumniRepository $alumniRepo
    ) {
        $this->notificationsRepo = $notificationsRepo;
        $this->eventsRepo = $eventsRepo;
        $this->announcementsRepo = $announcementsRepo;
        $this->alumniRepo = $alumniRepo;
    }

    public function getUserNotifications($member_id)
    {
        return $this->notificationsRepo->getByMemberId($member_id);
    }

    public function getAdminFeed()
    {
        // Fetch recent events
        $events = $this->eventsRepo->getAllEvents();

        // Fetch recent announcements
        $announcements = $this->announcementsRepo->getAllAnnouncements();

        // Combine and format standard structure
        $feed = [];

        foreach ($events as $event) {
            $feed[] = [
                'id' => 'event_' . $event['event_id'],
                'source_id' => $event['event_id'],
                'type' => 'event', // For filtering or UI logic
                'title' => 'Event Created: ' . $event['event_name'],
                'message' => 'New event scheduled on ' . $event['event_date'] . ' at ' . $event['location'],
                'created_at' => $event['created_at'] ?? $event['event_date'], // Fallback if created_at not in schema
                'category_tag' => 'Event',
                'category_color' => 'tag-blue'
            ];
        }

        foreach ($announcements as $announcement) {
            $feed[] = [
                'id' => 'ann_' . $announcement['announcement_id'],
                'source_id' => $announcement['announcement_id'],
                'type' => 'announcement',
                'title' => 'Announcement: ' . $announcement['title'],
                'message' => $announcement['message'],
                'created_at' => $announcement['date_posted'],
                'category_tag' => 'Announcement',
                'category_color' => 'tag-orange'
            ];
        }

        // Sort by created_at desc
        usort($feed, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return $feed;
    }

    public function forwardNotification($data)
    {
        $target = $data['target']; // 'all', 'batch', 'user'
        $value = $data['value'] ?? null; // batch year or user id
        $title = $data['title'];
        $message = $data['message'];
        $type = $data['category'] ?? 'info';

        $recipients = [];

        if ($target === 'all') {
            $allUsers = $this->alumniRepo->getAll();
            foreach ($allUsers as $user) {
                $recipients[] = $user['member_id'];
            }
        } elseif ($target === 'batch') {
            // Filter locally or add method to Repo. 
            // Since AlumniRepository has getAll, we can filter here for simplicity or add getByBatch.
            // For now, filtering array from getAll (optimize later if needed)
            $allUsers = $this->alumniRepo->getAll();
            foreach ($allUsers as $user) {
                if ($user['batch_year'] == $value) {
                    $recipients[] = $user['member_id'];
                }
            }
        } elseif ($target === 'user') {
            $recipients[] = $value;
        }

        $count = 0;
        foreach ($recipients as $member_id) {
            $this->notificationsRepo->create([
                'member_id' => $member_id,
                'title' => $title,
                'message' => $message,
                'type' => $type
            ]);
            $count++;
        }

        return ['count' => $count];
    }

    public function deleteNotification($id)
    {
        return $this->notificationsRepo->delete($id);
    }

    public function getSentHistory()
    {
        return $this->notificationsRepo->getDistinctNotifications();
    }

    public function deleteSentGroup($data)
    {
        // $data contains title, message, type
        return $this->notificationsRepo->deleteGroupByContent($data['title'], $data['message'], $data['type']);
    }
}
