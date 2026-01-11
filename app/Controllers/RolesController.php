<?php

namespace App\Controllers;

use App\Repositories\RolesRepository;
use App\Core\Response;
use App\Middleware\AuthMiddleware;

class RolesController {
    private RolesRepository $repo;
    private AuthMiddleware $auth;

    public function __construct(RolesRepository $repo) {
        $this->repo = $repo;
        $this->auth = new AuthMiddleware();
    }

    // Get all roles (Admin only)
    public function index() {
        $this->auth->requireRole([1]); // Only admin

        try {
            $roles = $this->repo->getAll();
            Response::json($roles, 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Unable to fetch roles'], 500);
        }
    }

    // Get single role (Admin only)
    public function show($params) {
        $this->auth->requireRole([1]); // Only admin

        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            Response::json(['error' => 'Invalid ID'], 400);
            return;
        }

        try {
            $role = $this->repo->getById($id);
            $role ? Response::json($role, 200) : Response::json(['error' => 'Role not found'], 404);
        } catch (\Exception $e) {
            Response::json(['error' => 'Unable to fetch role'], 500);
        }
    }
}