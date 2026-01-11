<?php

namespace App\Services;

use App\Core\Database;
use PDO;

class ReportService
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getDonationOverview()
    {
        // Query to get event details and aggregated donation stats
        $query = "
            SELECT 
                e.event_id,
                e.event_name,
                e.event_date,
                COALESCE(SUM(t.total_amount), 0) as total_donations,
                COUNT(DISTINCT t.member_id) as total_donors
            FROM events e
            LEFT JOIN transaction t ON e.event_id = t.event_id
            GROUP BY e.event_id
            ORDER BY e.event_date DESC
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Post-process for Status and Top Donor
        $result = [];
        $today = date('Y-m-d');

        foreach ($events as $event) {
            // Determine Status
            $status = ($event['event_date'] >= $today) ? 'Active' : 'Completed';

            // Find Top Donor for this event
            $topDonorName = 'N/A';
            if ($event['total_donations'] > 0) {
                // Query to find top donor
                // We prioritize name from transaction, or join alumni if needed. 
                // Transaction table has 'name' and 'member_id'.
                // If member_id is present, we might want the alumni name, but transaction 'name' might be the snapshot.
                // Let's use transaction 'name' as it's likely the donor name at time of donation.

                $topDonorQuery = "
                    SELECT COALESCE(t.name, CONCAT(a.fname, ' ', a.lname)) as name, SUM(t.total_amount) as amount
                    FROM transaction t
                    LEFT JOIN alumni a ON t.member_id = a.member_id
                    WHERE t.event_id = :event_id
                    GROUP BY t.member_id, t.name, a.fname, a.lname
                    ORDER BY amount DESC
                    LIMIT 1
                ";

                $stmtTop = $this->db->prepare($topDonorQuery);
                $stmtTop->bindValue(':event_id', $event['event_id']);
                $stmtTop->execute();
                $topDonor = $stmtTop->fetch(PDO::FETCH_ASSOC);

                if ($topDonor) {
                    $topDonorName = $topDonor['name'];
                }
            }

            $result[] = [
                'event_id' => $event['event_id'],
                'event_name' => $event['event_name'],
                'total_donations' => $event['total_donations'],
                'total_donors' => $event['total_donors'],
                'status' => $status,
                'top_donor' => $topDonorName
            ];
        }

        return $result;
    }
}
