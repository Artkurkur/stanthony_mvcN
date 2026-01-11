<?php
// app/Repositories/AlumniRepository.php
namespace App\Repositories;

use PDO;
use PDOException;
use Exception;

class AlumniRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // ✅ Find alumni by username
    public function findByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM alumni WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    // ✅ Find alumni by First and Last Name
    public function findByName(string $fname, string $lname): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM alumni WHERE fname = :fname AND lname = :lname LIMIT 1");
        $stmt->execute([':fname' => $fname, ':lname' => $lname]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }


    public function getAll(): array
    {
        try {
            $stmt = $this->db->query("SELECT member_id, fname, lname, username, role_id, mobile_number, batch_year FROM alumni");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw $e;
        }
    }

    public function getById(int $id): ?array
    {
        try {
            // Include password_hash so we can preserve it during updates
            // Added profile_picture
            $stmt = $this->db->prepare("SELECT member_id, fname, lname, username, role_id, mobile_number, batch_year, password_hash, profile_picture FROM alumni WHERE member_id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            return $data ?: null;
        } catch (PDOException $e) {
            throw $e;
        }
    }

    public function create(array $data): int
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO alumni (fname, lname, username, role_id, mobile_number, batch_year, password_hash)
                VALUES (:fname, :lname, :username, :role_id, :mobile_number, :batch_year, :password_hash)
            ");
            $stmt->execute([
                ':fname' => $data['fname'],
                ':lname' => $data['lname'],
                ':username' => $data['username'],
                ':role_id' => $data['role_id'],
                ':mobile_number' => $data['mobile_number'],
                ':batch_year' => $data['batch_year'],
                ':password_hash' => $data['password_hash']
            ]);
            return (int) $this->db->lastInsertId();
        } catch (PDOException $e) {
            // rethrow to service to handle (duplicate key, etc.)
            throw $e;
        }
    }

    public function update(int $id, array $data): bool
    {
        try {
            // Dynamic update to prevent wiping out missing fields
            $fields = [];
            $params = [':id' => $id];

            $allowed = ['fname', 'lname', 'username', 'role_id', 'mobile_number', 'batch_year', 'password_hash', 'profile_picture'];

            foreach ($allowed as $column) {
                if (array_key_exists($column, $data)) {
                    $fields[] = "$column = :$column";
                    $params[":$column"] = $data[$column];
                }
            }

            if (empty($fields)) {
                return false; // Nothing to update
            }

            $sql = "UPDATE alumni SET " . implode(', ', $fields) . " WHERE member_id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute($params);

        } catch (PDOException $e) {
            throw $e;
        }
    }

    public function delete(int $id): bool
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM alumni WHERE member_id = :id");
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            throw $e;
        }
    }
}
