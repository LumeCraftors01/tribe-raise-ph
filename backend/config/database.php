<?php
// ===================================================
// TRIBE OF RAISE PH — Database Configuration
// ===================================================

define('DB_HOST',     getenv('DB_HOST')     ?: 'localhost');
define('DB_PORT',     getenv('DB_PORT')     ?: '3306');
define('DB_NAME',     getenv('DB_NAME')     ?: 'tribe_of_raise_ph');
define('DB_USER',     getenv('DB_USER')     ?: 'torph_user');
define('DB_PASS',     getenv('DB_PASS')     ?: 'CHANGE_ME_IN_PRODUCTION');
define('DB_CHARSET',  'utf8mb4');

define('JWT_SECRET',  getenv('JWT_SECRET')  ?: 'CHANGE_THIS_SECRET_KEY_IN_PRODUCTION');
define('JWT_EXPIRY',  60 * 60 * 24 * 7);      // 7 days

define('APP_ENV',     getenv('APP_ENV')     ?: 'development');
define('RATE_LIMIT',  100);                    // Max requests per minute per IP
define('BCRYPT_COST', 12);

// ---- Create PDO Connection ----
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // Don't expose DB error details in production
        if (APP_ENV === 'development') {
            throw $e;
        }
        http_response_code(503);
        die(json_encode(['success' => false, 'message' => 'Database unavailable']));
    }

    return $pdo;
}
