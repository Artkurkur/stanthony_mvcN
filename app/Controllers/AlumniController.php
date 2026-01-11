<?php
// app/Controllers/AlumniController.php
namespace App\Controllers;

use App\Services\AlumniService;
use App\Core\Response;
use PDOException;

use App\Services\LogService;

class AlumniController
{
    private AlumniService $service;
    private LogService $logService;

    public function __construct(AlumniService $service, LogService $logService)
    {
        $this->service = $service;
        $this->logService = $logService;
    }

    /* ======================
       REGISTER (FIXED)
       DB-FIELD SAFE VERSION
    ====================== */
    public function register()
    {
        $rawInput = file_get_contents("php://input");
        $input = json_decode($rawInput, true);

        // ✅ Ensure valid JSON body
        if (!is_array($input)) {
            Response::json(["message" => "Invalid request body"], 400);
            return;
        }

        // ✅ SAFE FIELD EXTRACTION (NO UNDEFINED INDEX)
        $fname = trim($input['fname'] ?? '');
        $lname = trim($input['lname'] ?? '');
        $username = trim($input['username'] ?? '');
        $mobile_number = trim($input['mobile_number'] ?? '');
        $password = $input['password'] ?? '';
        $batch_year = $input['batch_year'] ?? null;

        // ✅ REQUIRED FIELD VALIDATION
        if (
            $fname === '' ||
            $lname === '' ||
            $username === '' ||
            $password === '' ||
            $batch_year === null
        ) {
            Response::json(["message" => "All required fields must be filled"], 400);
            return;
        }

        try {
            $data = [
                'fname' => $fname,
                'lname' => $lname,
                'username' => $username,
                'mobile_number' => $mobile_number, // ✅ DB FIELD
                'batch_year' => (int) $batch_year,
                'password_hash' => $password,   // ✅ HASHED
                'role_id' => 2                 // Default: Guest
            ];

            $id = $this->service->create($data);

            $this->logService->logAction($id, 'register', "New user registered: $username");

            Response::json([
                "message" => "Registered successfully",
                "member_id" => $id
            ], 201);

        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::json(["message" => "Username unavailable"], 409);
            } else {
                Response::json([
                    "message" => "Registration failed",
                    "error" => $e->getMessage() // REMOVE IN PROD
                ], 500);
            }
        }
    }

    /* ======================
       LOGIN (UNCHANGED)
    ====================== */
    public function login()
    {
        $input = json_decode(file_get_contents("php://input"), true);

        if (empty($input['username']) || empty($input['password_hash'])) {
            Response::json(["message" => "Username and password are required."], 400);
            return;
        }

        $result = $this->service->login(
            $input['username'],
            $input['password_hash']
        );

        if ($result) {
            $user = $result['user'];
            $this->logService->logAction($user['member_id'], 'login', "User logged in: {$user['username']}");

            Response::json([
                "message" => "Login successful",
                "token" => $result['token'],
                "user" => $result['user']
            ], 200);
        } else {
            // Optional: Log failed login attempts (requires knowing user_id, which we might not have, or log as NULL)
            // $this->logService->logAction(null, 'login_failed', "Failed login attempt for: {$input['username']}");
            Response::json(["message" => "Invalid username or password."], 401);
        }
    }

    /* ======================
       LIST ALUMNI
    ====================== */
    public function index()
    {
        try {
            $data = $this->service->listAll();
            Response::json($data, 200);
        } catch (\Exception $e) {
            Response::json(['error' => 'Unable to fetch records'], 500);
        }
    }

    public function show($params)
    {
        $id = (int) ($params['id'] ?? 0);

        if ($id <= 0) {
            Response::json(['error' => 'Invalid ID'], 400);
            return;
        }

        try {
            $alumni = $this->service->getById($id);
            $alumni
                ? Response::json($alumni, 200)
                : Response::json(['error' => 'Not found'], 404);
        } catch (\Exception $e) {
            Response::json(['error' => 'Unable to fetch record'], 500);
        }
    }

    public function profile()
    {
        $middleware = new \App\Middleware\AuthMiddleware();
        $user = $middleware->verifyToken();

        if ($user) {
            Response::json($user, 200);
        } else {
            Response::json(['error' => 'Unauthorized'], 401);
        }
    }

    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = $this->service->create($data);
        Response::json(['message' => 'Alumni added', 'id' => $id], 201);
    }

    public function update($params)
    {
        $id = (int) ($params['id'] ?? 0);

        // Enforce Authentication
        $auth = new \App\Middleware\AuthMiddleware();
        $currentUser = $auth->verifyToken();

        if (!$currentUser) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        $userId = $currentUser['member_id'];

        if ($id <= 0) {
            Response::json(['error' => 'Invalid ID'], 400);
            return;
        }

        try {
            // Check Content-Type to decide how to parse input
            $contentType = $_SERVER["CONTENT_TYPE"] ?? '';

            if (strpos($contentType, 'application/json') !== false) {
                // Handle JSON input
                $data = json_decode(file_get_contents('php://input'), true) ?: [];
                $this->service->update($id, $data);

                // Log Action
                $this->logService->logAction($userId, 'update_profile', "Updated Profile/Alumni ID: $id");

                Response::json(['message' => 'Updated successfully'], 200);
            } else {
                // Handle Multipart/Form-Data (Files + Fields)
                // $_POST contains the text fields, $_FILES contains files

                // Use the new updateWithUploads method if files might be present
                $updatedUser = $this->service->updateWithUploads($id, $_POST, $_FILES);

                // Log Action
                $this->logService->logAction($userId, 'update_profile', "Updated Profile/Alumni ID: $id (with file upload)");

                Response::json([
                    'message' => 'Updated successfully',
                    'user' => $updatedUser
                ], 200);
            }

        } catch (\Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }

    public function destroy($params)
    {
        $id = (int) ($params['id'] ?? 0);

        if ($id <= 0) {
            Response::json(['error' => 'Invalid ID'], 400);
            return;
        }

        $this->service->delete($id);

        // Log Action
        $auth = new \App\Middleware\AuthMiddleware();
        $user = $auth->getCurrentUser();
        $userId = $user['member_id'] ?? null;
        $this->logService->logAction($userId, 'delete_user', "Deleted Alumni ID: $id");

        Response::json(['message' => 'Deleted successfully'], 200);
    }

    public function logout()
    {
        $auth = new \App\Middleware\AuthMiddleware();
        $user = $auth->verifyToken();

        if ($user) {
            $this->logService->logAction($user['member_id'], 'logout', "User logged out: {$user['username']}");
        }

        Response::json(['message' => 'Logged out successfully'], 200);
    }
}
