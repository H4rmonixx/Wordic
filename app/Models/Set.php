<?php

namespace App\Models;

require_once __DIR__ . '/../Core/Database.php';
use App\Core\Database;

use PDO;

class Set {
    public int $set_id;
    public int $user_id;
    public ?string $user_username;
    public string $created_at;
    public string $name;
    public string $description;
    public bool $public;
    public ?string $image_name;
    public string $image_path;
    public static string $image_directory = "/assets/sets/";

    public static function getByID(int $set_id) : ?Set {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT s.set_id, u.user_id, u.username, s.created_at, s.name, s.description, s.public, s.image_name FROM `Set` s INNER JOIN `User` u ON u.user_id = s.user_id WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $set = new self();
        $set->set_id = $data['set_id'];
        $set->user_id = $data['user_id'];
        $set->user_username = $data['username'];
        $set->created_at = $data['created_at'];
        $set->name = $data['name'];
        $set->description = $data['description'];
        $set->public = (bool)$data['public'];
        $set->image_name = $data['image_name'];
        $set->image_path = self::$image_directory . $data['image_name'];

        return $set;
    }

    public static function getByUserID(int $user_id, bool $publicOnly = true, ?int $page = null, ?int $limit = null) : array {
        $pdo = Database::getConnection();

        $sql = "SELECT set_id, user_id, created_at, name, description, public, image_name FROM `Set` WHERE user_id = ?";
        if ($publicOnly) $sql .= " AND public = b'1'";
        if($page !== null && $limit !== null){
            $sql .= " LIMIT " . $limit . " OFFSET " . (($page-1) * $limit);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $setsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $sets = [];
        foreach ($setsData as $data) {
            $set = new self();
            $set->set_id = $data['set_id'];
            $set->user_id = $data['user_id'];
            $set->user_username = $data['username'];
            $set->created_at = $data['created_at'];
            $set->name = $data['name'];
            $set->description = $data['description'];
            $set->public = (bool)$data['public'];
            $set->image_name = $data['image_name'];
            $set->image_path = self::$image_directory . $data['image_name'];
            $sets[] = $set;
        }

        return $sets;
    }

    public static function getCountByUserID(int $user_id, bool $publicOnly = true) : int {
        $pdo = Database::getConnection();

        $sql = "SELECT Count(*) as count FROM `Set` WHERE user_id = ?";
        if ($publicOnly) $sql .= " AND public = b'1'";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC) ?? [];

        return $data['count'] ?? 0;
    }

    public static function ifExists(int $set_id) : bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM `Set` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data && $data['count'] > 0;
    }

    public static function getAuthInfo(int $set_id) : array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT user_id, public FROM `Set` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data ?? ["user_id" => -1, "public" => false];
    }

    public static function getWords(int $set_id) : array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT word_id, term, definition FROM `Word` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $wordsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $wordsData;
    }

    public static function getImage(int $set_id) : ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT image_name FROM `Set` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return ["image_name" => "", "image_path" => ""];
        }

        $data['image_path'] = self::$image_directory . $data['image_name'];
        return $data;
    }

    public static function editInfo(int $set_id, array $data) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE `Set` SET name = ?, description = ?, public = ? WHERE set_id = ?");
        $stmt->execute([$data['name'], $data['description'], $data['public'], $set_id]);

        return $stmt->rowCount();
    }

    public static function editImage(int $set_id, string $image_name) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE `Set` SET image_name = ? WHERE set_id = ?");
        $stmt->execute([$image_name, $set_id]);

        return $stmt->rowCount();
    }

    public static function deleteWord(int $word_id) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM `Word` WHERE word_id = ?");
        $stmt->execute([$word_id]);

        return $stmt->rowCount();
    }

    public static function addWord(int $set_id, string $term, string $definition) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO `Word` (set_id, term, definition) VALUES (?, ?, ?)");
        $stmt->execute([$set_id, $term, $definition]);

        return $stmt->rowCount();
    }

}
