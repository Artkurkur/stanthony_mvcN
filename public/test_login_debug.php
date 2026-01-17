<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB_DATABASE'];
$user = $_ENV['DB_USERNAME'];
$pass = $_ENV['DB_PASSWORD'];
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Database connection successful!<br>";

    $stmt = $pdo->query("SELECT member_id, username, role_id, password_hash FROM alumni LIMIT 5");
    $users = $stmt->fetchAll();

    echo "<h3>Existing Users:</h3>";
    echo "<pre>";
    foreach ($users as $u) {
        echo "ID: " . $u['member_id'] . " | User: " . $u['username'] . " | Role: " . $u['role_id'] . "\n";
        // Show length of hash to verify it's a hash
        echo "Hash: " . substr($u['password_hash'], 0, 10) . "... (" . strlen($u['password_hash']) . " chars)\n";
    }
    echo "</pre>";

} catch (\PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
