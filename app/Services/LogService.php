<?php

namespace App\Services;

use App\Repositories\LogRepository;

class LogService
{
    private $repository;

    public function __construct(LogRepository $repository)
    {
        $this->repository = $repository;
    }

    public function logAction($userId, $action, $details)
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

        return $this->repository->create([
            'user_id' => $userId, // Can be null
            'action' => $action,
            'details' => $details,
            'ip_address' => $ip
        ]);
    }

    public function getAllLogs()
    {
        return $this->repository->getAll();
    }
}
