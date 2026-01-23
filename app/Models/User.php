<?php

namespace App\Models;

require_once __DIR__ . '/../Core/Database.php';
use App\Core\Database;

use PDO;

class User {
    public int $user_id;
    public string $username;
    public string $email;
    public string $created_at;

    public static function getByID(int $user_id) : ?User {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT user_id, username, email, created_at FROM User WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $user = new self();
        $user->user_id = $data['user_id'];
        $user->username = $data['username'];
        $user->email = $data['email'];
        $user->created_at = $data['created_at'];

        return $user;
    }

    public static function getByUsername(string $username) : ?User {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT user_id, username, email, created_at FROM `User` WHERE username LIKE ?");
        $stmt->execute([$username]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $user = new self();
        $user->user_id = $data['user_id'];
        $user->username = $data['username'];
        $user->email = $data['email'];
        $user->created_at = $data['created_at'];

        return $user;
    }

    public static function ifExists(int $user_id) : bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM `User` WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data && $data['count'] > 0;
    }

    public static function login(string $username, string $password) : ?User {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT user_id, username, email, password, created_at FROM `User` WHERE username LIKE ?");
        $stmt->execute([$username]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data || !password_verify($password, $data['password'])) {
            return null;
        }

        unset($data['password']);

        $user = new self();
        $user->user_id = $data['user_id'];
        $user->username = $data['username'];
        $user->email = $data['email'];
        $user->created_at = $data['created_at'];

        return $user;
    }

}
