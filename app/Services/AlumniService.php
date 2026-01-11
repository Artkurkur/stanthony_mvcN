<?php

namespace App\Services;

use App\Repositories\AlumniRepository;
use InvalidArgumentException;
use PDOException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AlumniService
{
    private AlumniRepository $repo;
    private string $jwtSecret;

    public function __construct(AlumniRepository $repo)
    {
        $this->repo = $repo;
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'default_secret_key';
    }

    // ✅ Login function (now includes JWT)
    public function login(string $username, string $password): ?array
    {
        $user = $this->repo->findByUsername($username);

        if (!$user) {
            return null;
        }

        // Check password (hashed or plain text)
        $validPassword = password_verify($password, $user['password_hash']) || $password === $user['password_hash'];
        if (!$validPassword) {
            return null;
        }

        // Remove password from response
        unset($user['password_hash']);

        // ✅ Generate JWT Token
        $payload = [
            'iss' => $_ENV['APP_URL'] ?? 'http://localhost',
            'aud' => $_ENV['APP_URL'] ?? 'http://localhost',
            'iat' => time(),
            'exp' => time() + (60 * 60), // expires in 1 hour
            'user' => [
                'member_id' => $user['member_id'] ?? null,
                'username' => $user['username'] ?? null,
                'role_id' => $user['role_id'] ?? null
            ]
        ];

        $token = JWT::encode($payload, $this->jwtSecret, 'HS256');

        // ✅ Return both user and token
        return [
            'token' => $token,
            'user' => $user
        ];
    }

    public function listAll(): array
    {
        return $this->repo->getAll();
    }

    public function getById(int $id): ?array
    {
        return $this->repo->getById($id);
    }

    public function create(array $data): int
    {
        if (empty($data['fname']) || empty($data['lname']) || empty($data['username'])) {
            throw new InvalidArgumentException("fname, lname, and username are required");
        }

        if (!empty($data['password_hash'])) {
            $data['password_hash'] = password_hash($data['password_hash'], PASSWORD_BCRYPT);
        } else {
            $data['password_hash'] = password_hash('', PASSWORD_BCRYPT);
        }

        try {
            return $this->repo->create($data);
        } catch (PDOException $e) {
            throw $e;
        }
    }

    public function update(int $id, array $data): bool
    {
        // Only hash password if it's provided and not empty
        if (isset($data['password_hash']) && $data['password_hash'] !== '' && !empty($data['password_hash'])) {
            $data['password_hash'] = password_hash($data['password_hash'], PASSWORD_BCRYPT);
        } else {
            // If password is not provided, keep the existing one
            // Ideally we shouldn't fetch here if we just unset the key in controller, 
            // but for safety in service:
            $existing = $this->repo->getById($id);
            if ($existing) {
                // If data doesn't have password_hash, we don't update it (Repo should handle partial updates or we merge here)
                // Assuming Repo updates all fields, we need to preserve existing password.
                $data['password_hash'] = $existing['password_hash'];
            } else {
                throw new InvalidArgumentException("Alumni not found");
            }
        }

        try {
            return $this->repo->update($id, $data);
        } catch (PDOException $e) {
            throw $e;
        }
    }

    public function updateWithUploads(int $id, array $data, ?array $files): array
    {
        // 1. Handle File Upload
        if (isset($files['profile_picture']) && $files['profile_picture']['error'] === UPLOAD_ERR_OK) {
            // ✅ FIXED: Save to root asset folder (../asset/uploads)
            $uploadDir = __DIR__ . '/../../asset/uploads/';

            // Create dir if not exists
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $file = $files['profile_picture'];
            $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($fileExt, $allowed)) {
                throw new InvalidArgumentException("Invalid file type. Only JPG, PNG, and GIF are allowed.");
            }

            // Generate unique name
            $newFilename = 'profile_' . $id . '_' . time() . '.' . $fileExt;
            $destination = $uploadDir . $newFilename;

            if (move_uploaded_file($file['tmp_name'], $destination)) {
                // Save RELATIVE path or URL as requested
                // User said: "only the url of that image from that "uploads" folder will be saved"
                // Assuming relative path from public root for easiness in Frontend
                $data['profile_picture'] = '../asset/uploads/' . $newFilename;
            } else {
                throw new \Exception("Failed to upload image.");
            }
        }

        // 2. Update Database
        $this->update($id, $data);

        // 3. Return updated data (fetching fresh)
        $updatedUser = $this->getById($id);

        // Remove sensitive data
        if (isset($updatedUser['password_hash']))
            unset($updatedUser['password_hash']);

        return $updatedUser;
    }

    public function delete(int $id): bool
    {
        return $this->repo->delete($id);
    }
}
