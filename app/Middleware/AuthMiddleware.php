<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use App\Core\Response;

class AuthMiddleware
{
    private string $jwtSecret;

    public function __construct()
    {
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'default_secret_key';
    }

    // Verify JWT token and return user data
    public function verifyToken(): ?array
    {
        // Try to get Authorization header from various sources
        $headers = [];
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        }

        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (empty($authHeader)) {
            return null;
        }

        // Extract token from "Bearer <token>"
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            return null;
        }

        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            return (array) $decoded->user;
        } catch (ExpiredException $e) {
            // Token has expired
            return null;
        } catch (SignatureInvalidException $e) {
            // Token signature is invalid
            return null;
        } catch (\Exception $e) {
            // Any other JWT error
            return null;
        }
    }

    // Check if user has required role
    public function requireRole(array $allowedRoles): void
    {
        $user = $this->verifyToken();

        if (!$user) {
            Response::json(['message' => 'Unauthorized. Please login.'], 401);
            exit;
        }

        $userRoleId = $user['role_id'] ?? null;

        if (!in_array($userRoleId, $allowedRoles)) {
            Response::json(['message' => 'Forbidden. You do not have permission to access this resource.'], 403);
            exit;
        }
    }

    // Get current authenticated user
    public function getCurrentUser(): ?array
    {
        return $this->verifyToken();
    }

    // Check if user is authenticated (without role check)
    public function requireAuth(): void
    {
        $user = $this->verifyToken();

        if (!$user) {
            Response::json(['message' => 'Unauthorized. Please login.'], 401);
            exit;
        }
    }

    // Check if the authenticated user is the owner or admin
    public function requireOwnerOrAdmin(int $resourceOwnerId): void
    {
        $user = $this->verifyToken();

        if (!$user) {
            Response::json(['message' => 'Unauthorized. Please login.'], 401);
            exit;
        }

        $isAdmin = $user['role_id'] === 1;
        $isOwner = $user['member_id'] === $resourceOwnerId;

        if (!$isAdmin && !$isOwner) {
            Response::json(['message' => 'Forbidden. You can only access your own resources.'], 403);
            exit;
        }
    }
}