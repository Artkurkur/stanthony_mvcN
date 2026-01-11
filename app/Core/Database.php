<?php
// app/Core/Database.php

namespace App\Core;

require_once __DIR__ . '/Env.php';

use PDO;
use PDOException;

class Database {
    private static ?PDO $pdo = null;

    public static function connect(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $host = Env::get('DB_HOST', '127.0.0.1');
        $db   = Env::get('DB_NAME', 'academy_db');
        $user = Env::get('DB_USER', 'root');
        $pass = Env::get('DB_PASS', '');
        $charset = Env::get('DB_CHARSET', 'utf8mb4');

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        try {
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false, // use native prepares
            ];
            self::$pdo = new PDO($dsn, $user, $pass, $options);
            return self::$pdo;
        } catch (PDOException $e) {
            // Log error internally in production. For now return generic message.
            // Do NOT reveal DB error details to clients in production.
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }
}




//<?php
// app/Core/Database.php

//namespace App\Core;

//require_once __DIR__ . '/Env.php'; // load Env class manually

//use PDO;
//use PDOException;

//class Database {
    //public static function connect(): PDO {
        //$host = Env::get('DB_HOST', 'localhost');
        //$db   = Env::get('DB_NAME', 'academy_db');
        //$user = Env::get('DB_USER', 'root');
        //$pass = Env::get('DB_PASS', '');
        //$charset = 'utf8mb4';

        //$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        //try {
          //  $pdo = new PDO($dsn, $user, $pass, [
            //    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
              //  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            //]);
            //return $pdo;
        //} catch (PDOException $e) {
          //  die("Database connection failed: " . $e->getMessage());
       // }
    //}
//}
