<?php

namespace App\Core;

use PDO;
use PDOException;

class Database {
    private static ?PDO $pdo = null;
    private static bool $transactionActive = false;

    // INITIALIZATION
    public static function init(): void {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/config.php';
            $db = $config['db'];

            try {
                self::$pdo = new PDO("mysql:host={$db['host']};dbname={$db['name']}", $db['user'], $db['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
            } catch (PDOException $e) {
                die("Error while connecting to database!" . $e->getMessage());
            }
        }
    }

    // TRANSACTION MANAGEMENT
    public static function startTransaction(): bool {
        if (self::$pdo === null) {
            self::init();
        }

        if (self::$transactionActive) {
            return false;
        }

        try{
            self::$pdo->beginTransaction();
            self::$transactionActive = true;
            return true;
        } catch (PDOException $e) {
            return false;
        }

    }

    public static function commitTransaction(): bool {
        if (self::$pdo === null || !self::$transactionActive) {
            return false;
        }
        try{
            self::$pdo->commit();
            self::$transactionActive = false;
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function rollbackTransaction(): bool {
        if (self::$pdo === null || !self::$transactionActive) {
            return false;
        }
        try{
            self::$pdo->rollBack();
            self::$transactionActive = false;
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function isTransactionActive(): bool {
        return self::$transactionActive;
    }

    // CONNECTION MANAGEMENT
    public static function closeConnection(): void {
        self::$pdo = null;
        self::$transactionActive = false;
    }

    public static function getConnection(): ?PDO {
        if (self::$pdo === null) {
            self::init();
            self::$transactionActive = false;
        }
        return self::$pdo;
    }
    
}
