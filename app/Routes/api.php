<?php
require_once __DIR__ . '/../Core/Router.php';
require_once __DIR__ . '/../Core/Database.php';
require_once __DIR__ . '/../Core/Response.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

// Alumni
require_once __DIR__ . '/../Repositories/AlumniRepository.php';
require_once __DIR__ . '/../Services/AlumniService.php';
require_once __DIR__ . '/../Controllers/AlumniController.php';

// Announcements
require_once __DIR__ . '/../Repositories/AnnouncementsRepository.php';
require_once __DIR__ . '/../Services/AnnouncementsService.php';
require_once __DIR__ . '/../Controllers/AnnouncementsController.php';

// Events
require_once __DIR__ . '/../Repositories/EventsRepository.php';
require_once __DIR__ . '/../Services/EventsService.php';
require_once __DIR__ . '/../Controllers/EventsController.php';

// Event Types
require_once __DIR__ . '/../Repositories/EventTypesRepository.php';
require_once __DIR__ . '/../Services/EventTypesService.php';
require_once __DIR__ . '/../Controllers/EventTypesController.php';

// Event Attendance
require_once __DIR__ . '/../Repositories/EventAttendanceRepository.php';
require_once __DIR__ . '/../Services/EventAttendanceService.php';
require_once __DIR__ . '/../Controllers/EventAttendanceController.php';

// Fees
require_once __DIR__ . '/../Repositories/FeesRepository.php';
require_once __DIR__ . '/../Services/FeesService.php';
require_once __DIR__ . '/../Controllers/FeesController.php';

// Payment Method
require_once __DIR__ . '/../Repositories/PaymentMethodRepository.php';
require_once __DIR__ . '/../Services/PaymentMethodService.php';
require_once __DIR__ . '/../Controllers/PaymentMethodController.php';

// Roles
require_once __DIR__ . '/../Repositories/RolesRepository.php';
require_once __DIR__ . '/../Controllers/RolesController.php';

// RSVP
require_once __DIR__ . '/../Repositories/RsvpRepository.php';
require_once __DIR__ . '/../Services/RsvpService.php';
require_once __DIR__ . '/../Controllers/RsvpController.php';

// Notifications
require_once __DIR__ . '/../Repositories/NotificationsRepository.php';
require_once __DIR__ . '/../Services/NotificationsService.php';
require_once __DIR__ . '/../Services/SmsService.php';
require_once __DIR__ . '/../Controllers/NotificationsController.php';

// Reports
require_once __DIR__ . '/../Services/ReportService.php';
require_once __DIR__ . '/../Controllers/ReportsController.php';

// Logs
require_once __DIR__ . '/../Repositories/LogRepository.php';
require_once __DIR__ . '/../Services/LogService.php';
require_once __DIR__ . '/../Controllers/LogController.php';

// Transaction
require_once __DIR__ . '/../Repositories/TransactionRepository.php';
require_once __DIR__ . '/../Repositories/TransactionDetailsRepository.php';
require_once __DIR__ . '/../Services/TransactionService.php';
require_once __DIR__ . '/../Controllers/TransactionController.php';

use App\Core\Router;
use App\Core\Database;
use App\Repositories\AlumniRepository;
use App\Services\AlumniService;
use App\Controllers\AlumniController;

use App\Repositories\AnnouncementsRepository;
use App\Services\AnnouncementsService;
use App\Controllers\AnnouncementsController;

use App\Repositories\EventsRepository;
use App\Services\EventsService;
use App\Controllers\EventsController;

use App\Repositories\EventTypesRepository;
use App\Services\EventTypesService;
use App\Controllers\EventTypesController;

use App\Repositories\EventAttendanceRepository;
use App\Services\EventAttendanceService;
use App\Controllers\EventAttendanceController;

use App\Repositories\FeesRepository;
use App\Services\FeesService;
use App\Controllers\FeesController;

use App\Repositories\PaymentMethodRepository;
use App\Services\PaymentMethodService;
use App\Controllers\PaymentMethodController;

use App\Repositories\RolesRepository;
use App\Controllers\RolesController;

use App\Repositories\RsvpRepository;
use App\Services\RsvpService;
use App\Controllers\RsvpController;

use App\Repositories\NotificationsRepository;
use App\Services\NotificationsService;
use App\Controllers\NotificationsController;

use App\Repositories\TransactionRepository;
use App\Repositories\TransactionDetailsRepository;
use App\Services\TransactionService;
use App\Controllers\TransactionController;

use App\Repositories\LogRepository;
use App\Services\LogService;
use App\Controllers\LogController;

use App\Services\ReportService;
use App\Controllers\ReportsController;

$router = new Router();
$db = Database::connect();

// Instantiate Repositories
$alumniRepo = new AlumniRepository($db);
$announcementsRepo = new AnnouncementsRepository($db);
$eventsRepo = new EventsRepository($db);
$eventTypesRepo = new EventTypesRepository($db);
$attendanceRepo = new EventAttendanceRepository($db);
$feesRepo = new FeesRepository($db);
$paymentMethodRepo = new PaymentMethodRepository($db);
$rolesRepo = new RolesRepository($db);
$rsvpRepo = new RsvpRepository($db);
$notificationsRepo = new NotificationsRepository($db);
$transactionRepo = new TransactionRepository($db);
$transactionDetailsRepo = new TransactionDetailsRepository($db);
$logRepo = new LogRepository($db);

// Instantiate Services
$alumniService = new AlumniService($alumniRepo);
$announcementsService = new AnnouncementsService($announcementsRepo);
$eventsService = new EventsService($eventsRepo);
$eventTypesService = new EventTypesService($eventTypesRepo);
$attendanceService = new EventAttendanceService($attendanceRepo);
$feesService = new FeesService($feesRepo);
$paymentMethodService = new PaymentMethodService($paymentMethodRepo);
$rsvpService = new RsvpService($rsvpRepo);
$smsService = new App\Services\SmsService();
$notificationsService = new NotificationsService($notificationsRepo, $eventsRepo, $announcementsRepo, $alumniRepo, $smsService);
$transactionService = new TransactionService($transactionRepo, $transactionDetailsRepo, $feesRepo, $alumniRepo);
$logService = new LogService($logRepo);
$reportService = new ReportService($db);

// Instantiate Controllers
// Inject LogService where needed
$alumniController = new AlumniController($alumniService, $logService);
$announcementsController = new AnnouncementsController($announcementsService, $logService);
$eventsController = new EventsController($eventsService, $logService);
$eventTypesController = new EventTypesController($eventTypesService);
$attendanceController = new EventAttendanceController($attendanceService, $logService);
$feesController = new FeesController($feesService);
$paymentMethodController = new PaymentMethodController($paymentMethodService);
$rolesController = new RolesController($rolesRepo);
$rsvpController = new RsvpController($rsvpService);
$notificationsController = new NotificationsController($notificationsService);
$transactionController = new TransactionController($transactionService, $logService);
$logController = new LogController($logService);
$reportsController = new ReportsController($reportService);


// ===================================
// PUBLIC ROUTES
// ===================================
$router->post('/api/register', fn() => $alumniController->register());
$router->post('/api/login', fn() => $alumniController->login());
$router->post('/api/logout', fn() => $alumniController->logout());


// ===================================
// PROTECTED ROUTES
// ===================================

// ALUMNI
$router->get('/api/profile', fn() => $alumniController->profile());
$router->get('/api/alumni', fn() => $alumniController->index());
$router->get('/api/alumni/{id}', fn($params) => $alumniController->show($params));
$router->post('/api/alumni', fn() => $alumniController->store());
$router->put('/api/alumni/{id}', fn($params) => $alumniController->update($params));
$router->post('/api/alumni/{id}', fn($params) => $alumniController->update($params)); // Allow POST for file uploads
$router->delete('/api/alumni/{id}', fn($params) => $alumniController->destroy($params));

// ANNOUNCEMENTS
$router->get('/api/announcements', fn() => $announcementsController->index());
$router->get('/api/announcements/{id}', fn($params) => $announcementsController->show($params));
$router->post('/api/announcements', fn() => $announcementsController->store());
$router->put('/api/announcements/{id}', fn($params) => $announcementsController->update($params));
$router->delete('/api/announcements/{id}', fn($params) => $announcementsController->destroy($params));

// EVENTS
$router->get('/api/events', fn() => $eventsController->index());
$router->get('/api/events/{id}', fn($params) => $eventsController->show($params));
$router->post('/api/events', fn() => $eventsController->store());
$router->put('/api/events/{id}', fn($params) => $eventsController->update($params));
$router->delete('/api/events/{id}', fn($params) => $eventsController->destroy($params));
$router->get('/api/events/batch/{year}', fn($params) => $eventsController->getByBatchYear($params));
$router->get('/api/events/status/{status}', fn($params) => $eventsController->getByStatus($params));
$router->get('/api/events/{id}/attendees', fn($params) => $eventsController->getAttendees($params));

// EVENT TYPES
$router->get('/api/event-types', fn() => $eventTypesController->index());
$router->get('/api/event-types/{id}', fn($params) => $eventTypesController->show($params));
$router->post('/api/event-types', fn() => $eventTypesController->store());
$router->put('/api/event-types/{id}', fn($params) => $eventTypesController->update($params));
$router->delete('/api/event-types/{id}', fn($params) => $eventTypesController->destroy($params));

// EVENT ATTENDANCE
$router->get('/api/event-attendance', fn() => $attendanceController->index());
$router->get('/api/event-attendance/event/{id}', fn($params) => $attendanceController->getByEventId($params));
$router->get('/api/event-attendance/member/{id}', fn($params) => $attendanceController->getByMemberId($params));
$router->post('/api/event-attendance', fn() => $attendanceController->store());
$router->put('/api/event-attendance/{id}', fn($params) => $attendanceController->update($params));
$router->delete('/api/event-attendance/{id}', fn($params) => $attendanceController->destroy($params));

// FEES
$router->get('/api/fees', fn() => $feesController->index());
$router->get('/api/fees/active', fn() => $feesController->getActive());
$router->get('/api/fees/{id}', fn($params) => $feesController->show($params));
$router->post('/api/fees', fn() => $feesController->store());
$router->put('/api/fees/{id}', fn($params) => $feesController->update($params));
$router->delete('/api/fees/{id}', fn($params) => $feesController->destroy($params));

// PAYMENT METHODS
$router->get('/api/payment-methods', fn() => $paymentMethodController->index());
$router->get('/api/payment-methods/{id}', fn($params) => $paymentMethodController->show($params));
$router->post('/api/payment-methods', fn() => $paymentMethodController->store());
$router->put('/api/payment-methods/{id}', fn($params) => $paymentMethodController->update($params));
$router->delete('/api/payment-methods/{id}', fn($params) => $paymentMethodController->destroy($params));

// ROLES
$router->get('/api/roles', fn() => $rolesController->index());
$router->get('/api/roles/{id}', fn($params) => $rolesController->show($params));

// RSVP
$router->get('/api/rsvp', fn() => $rsvpController->index());
$router->get('/api/rsvp/event/{id}', fn($params) => $rsvpController->getByEventId($params));
$router->get('/api/rsvp/member/{id}', fn($params) => $rsvpController->getByMemberId($params));
$router->post('/api/rsvp', fn() => $rsvpController->store());
$router->put('/api/rsvp/{id}', fn($params) => $rsvpController->update($params));
$router->delete('/api/rsvp/{id}', fn($params) => $rsvpController->destroy($params));

// TRANSACTIONS
$router->get('/api/transactions', fn() => $transactionController->index());
$router->get('/api/transactions/{id}', fn($params) => $transactionController->show($params));
$router->get('/api/transactions/member/{id}', fn($params) => $transactionController->getByMemberId($params));
$router->post('/api/transactions', fn() => $transactionController->store());
$router->put('/api/transactions/{id}', fn($params) => $transactionController->update($params));
$router->delete('/api/transactions/{id}', fn($params) => $transactionController->destroy($params));

// NOTIFICATIONS
$router->get('/api/notifications', fn() => $notificationsController->index());
$router->post('/api/notifications', fn() => $notificationsController->store()); // Forward logic
$router->post('/api/notifications/delete-group', fn() => $notificationsController->destroyGroup());
$router->delete('/api/notifications/{id}', fn($params) => $notificationsController->destroy($params));

// LOGS
$router->get('/api/logs', fn() => $logController->index());

// REPORTS
$router->get('/api/reports/donation-overview', fn() => $reportsController->index());

// Dispatch request
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
