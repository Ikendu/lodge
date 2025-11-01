<?php
require_once __DIR__ . '/load_env.php';


// Load environment variables
loadEnv(__DIR__ . '/.env');

$paystackSecret = $_ENV['PAYSTACK_SECRET_KEY'];


class Database {
    private $conn;

    // Development (default)
    private $dev = [
        'host' => 'localhost',
        'db_name' => 'lodge',
        'username' => 'root',
        'password' => ''
    ];

    // Production credentials (will be attempted if available)
    private $prod = [
        'host' => 'localhost',
        'db_name' => 'morelink_lodge',
        'username' => 'morelink_lodge',
        'password' => '9652Aa@!@!@!@'
    ];

    /**
     * Attempt to connect. Selection order:
     * 1. If DB_ENV env var is set to 'production' or 'development', use that.
     * 2. Otherwise, try production first; if it fails, fall back to development.
     */
    public function connect() {
        $this->conn = null;

        // Allow explicit override via environment variable
        $env = getenv('DB_ENV') ?: ($_SERVER['DB_ENV'] ?? null);
        $tryOrder = [];
        if ($env === 'production') {
            $tryOrder = ['prod', 'dev'];
        } elseif ($env === 'development') {
            $tryOrder = ['dev', 'prod'];
        } else {
            // No explicit env; try production first then development
            $tryOrder = ['prod', 'dev'];
        }

        $lastException = null;
        foreach ($tryOrder as $which) {
            $cfg = $this->{$which};
            try {
                $dsn = "mysql:host={$cfg['host']};dbname={$cfg['db_name']};charset=utf8";
                $pdo = new PDO($dsn, $cfg['username'], $cfg['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                $this->conn = $pdo;
                return $this->conn;
            } catch (PDOException $e) {
                // store last exception but do not expose credentials
                $lastException = $e;
                // continue to next candidate
            }
        }

        // If we get here, all attempts failed
        $msg = 'Database connection failed.';
        // Include a short hint for debugging (no credentials)
        if ($lastException) {
            $msg .= ' Reason: ' . $lastException->getMessage();
        }
        echo json_encode(["success" => false, "message" => $msg]);
        exit;
    }
}
?>
