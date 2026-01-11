<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class LogRepository
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(array $data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO system_logs (user_id, action, details, ip_address)
            VALUES (:user_id, :action, :details, :ip_address)
        ");
        return $stmt->execute([
            ':user_id' => $data['user_id'],
            ':action' => $data['action'],
            ':details' => $data['details'],
            ':ip_address' => $data['ip_address']
        ]);
    }

    public function getAll()
    {
        // Join with alumni to get user names
        $stmt = $this->db->query("
            SELECT l.*, CONCAT(a.fname, ' ', a.lname) as user_name, a.username
            FROM system_logs l
            LEFT JOIN alumni a ON l.user_id = a.member_id
            ORDER BY l.created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
