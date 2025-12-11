<?php

namespace App\Models;

require_once __DIR__ . '/../Core/Database.php';
use App\Core\Database;

use PDO;

class Set {
    public int $set_id;
    public int $user_id;
    public string $created_at;
    public string $name;
    public string $description;
    public bool $public;
    public ?string $image_name;

    public static function getByID(int $set_id) : ?Set {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT set_id, user_id, created_at, name, description, public, image_name FROM `Set` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $set = new self();
        $set->set_id = $data['set_id'];
        $set->user_id = $data['user_id'];
        $set->created_at = $data['created_at'];
        $set->name = $data['name'];
        $set->description = $data['description'];
        $set->public = (bool)$data['public'];
        $set->image_name = $data['image_name'];

        return $set;
    }

    public static function getByUserID(int $user_id, bool $publicOnly = false) : array {
        $pdo = Database::getConnection();
        if ($publicOnly) {
            $stmt = $pdo->prepare("SELECT set_id, user_id, created_at, name, description, public, image_name FROM `Set` WHERE user_id = ? AND public = b'1'");
            $stmt->execute([$user_id]);
        } else {
            $stmt = $pdo->prepare("SELECT set_id, user_id, created_at, name, description, public, image_name FROM `Set` WHERE user_id = ?");
            $stmt->execute([$user_id]);
        }
        $setsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $sets = [];
        foreach ($setsData as $data) {
            $set = new self();
            $set->set_id = $data['set_id'];
            $set->user_id = $data['user_id'];
            $set->created_at = $data['created_at'];
            $set->name = $data['name'];
            $set->description = $data['description'];
            $set->public = (bool)$data['public'];
            $set->image_name = $data['image_name'];
            $sets[] = $set;
        }

        return $sets;
    }

    public static function ifExists(int $set_id) : bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM `Set` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data && $data['count'] > 0;
    }

    public static function getWords(int $set_id) : array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT word_id, term, definition FROM `Word` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $wordsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $wordsData;
    }

}
