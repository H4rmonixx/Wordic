<?php

namespace App\Models;

require_once __DIR__ . '/../Core/Database.php';
use App\Core\Database;

use PDO;
use DateTime;

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
    public int $words_count;
    public ?array $meta;

    public static function getByID(int $set_id, int $user_id) : ?Set {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT s.set_id, u.user_id, u.username, s.created_at, s.name, s.description, s.public, s.image_name FROM `Set` s INNER JOIN `User` u ON u.user_id = s.user_id WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

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

        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM `Word` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $countData = $stmt->fetch(PDO::FETCH_ASSOC);
        $set->words_count = $countData ? (int)$countData['count'] : 0;

        $stmt = $pdo->prepare("SELECT track_progress, last_played FROM `SetMeta` WHERE set_id = ? AND user_id = ?");
        $stmt->execute([$set_id, $user_id]);
        $metaData = $stmt->fetch(PDO::FETCH_ASSOC);
        $set->meta = $metaData ? [
            "track_progress" => (bool)$metaData['track_progress'],
            "last_played" => $metaData['last_played']
        ] : null;

        return $set;
    }

    public static function getByUserID(int $user_id, bool $isOwner = false, ?int $page = null, ?int $limit = null, ?array $omit_ids = []) : array {
        $pdo = Database::getConnection();

        $params = [$user_id];

        $sql = "SELECT set_id, user_id, created_at, name, description, public, image_name FROM `Set` WHERE user_id = ?";
        if(!$isOwner) $sql .= " AND public = b'1'";
        if(count($omit_ids) > 0){
            $sql .= ' AND set_id NOT IN (?' . str_repeat(", ?", count($omit_ids) - 1) . ')';
            $params = array_merge($params, $omit_ids);
        }
        $sql .= " ORDER BY created_at DESC";
        if($page !== null && $limit !== null){
            $sql .= " LIMIT " . $limit . " OFFSET " . (($page-1) * $limit);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
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
            $set->image_path = self::$image_directory . $data['image_name'];
            $sets[] = $set;
        }

        return $sets;
    }

    public static function create(int $user_id, string $name, string $description, int $public) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO `Set` (user_id, name, description, public) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $name, $description, $public]);

        return $pdo->lastInsertId();
    }

    public static function delete(int $set_id) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM `Set` WHERE set_id = ?");
        $stmt->execute([$set_id]);

        return $stmt->rowCount();
    }

    public static function getCountByUserID(int $user_id, bool $isOwner = false) : int {
        $pdo = Database::getConnection();

        $sql = "SELECT Count(*) as count FROM `Set` WHERE user_id = ?";
        if (!$isOwner) $sql .= " AND public = b'1'";

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

    public static function updateMeta(int $user_id, int $set_id, array $config) : int {
        $pdo = Database::getConnection();

        // Check if meta exists
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM `SetMeta` WHERE user_id = ? AND set_id = ?");
        $stmt->execute([$user_id, $set_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        if ($data && $data['count'] > 0) {
            // Update existing meta
            $sql = "UPDATE `SetMeta` SET ";
            $params = [];
            foreach($config as $key => $value){
                $sql .= "$key = ?, ";
                $params[] = $value;
            }
            $sql = rtrim($sql, ", ");
            $sql .= " WHERE user_id = ? AND set_id = ?";
            $params[] = $user_id;
            $params[] = $set_id;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            // Insert new meta
            $track_progress = $config['track_progress'] ?? true;
            $last_played = $config['last_played'] ?? (new DateTime())->format("Y-m-d H:i:s");
            $stmt = $pdo->prepare("INSERT INTO `SetMeta` (set_id, user_id, last_played, track_progress) VALUES (?, ?, ?, ?)");
            $stmt->execute([$set_id, $user_id, $last_played, $track_progress]);
        }

        return $stmt->rowCount();
    }

    public static function getWords(int $set_id) : array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT word_id, term, definition FROM `Word` WHERE set_id = ?");
        $stmt->execute([$set_id]);
        $wordsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $wordsData;
    }

    public static function getWordsToRehearse(int $user_id, int $set_id) : array {
        $pdo = Database::getConnection();

        // Words with progress due for review
        $stmt = $pdo->prepare("SELECT `Word`.word_id, term, definition FROM `Word` INNER JOIN `WordProgress` ON `Word`.word_id = `WordProgress`.word_id WHERE `Word`.set_id = ? AND `WordProgress`.user_id = ? AND `WordProgress`.next_review < CURRENT_TIMESTAMP");
        $stmt->execute([$set_id, $user_id]);
        $wordsData_withProgress = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        // Words without progress (new words)
        $stmt = $pdo->prepare("SELECT `Word`.word_id, term, definition FROM `Word` WHERE `Word`.set_id = ? AND `Word`.word_id NOT IN (SELECT word_id FROM `WordProgress` WHERE user_id = ?)");
        $stmt->execute([$set_id, $user_id]);
        $wordsData_new = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        return array_merge($wordsData_withProgress, $wordsData_new);
    }

    public static function getNearestReviewDate(int $user_id, int $set_id) : ?string {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT MIN(next_review) as nearest_review FROM `WordProgress` INNER JOIN `Word` ON `WordProgress`.word_id = `Word`.word_id WHERE `Word`.set_id = ? AND `WordProgress`.user_id = ?");
        $stmt->execute([$set_id, $user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        return $data && $data['nearest_review'] ? $data['nearest_review'] : null;
    }

    private static function getNextReviewDate(int $repetition) : DateTime {
        $nextReview = new DateTime();
        switch($repetition) {
            case -5:
                $nextReview->modify('+1 hour');
                break;
            case -4:
                $nextReview->modify('+30 minutes');
                break;
            case -3:
                $nextReview->modify('+15 minutes');
                break;
            case -2:
                $nextReview->modify('+5 minutes');
                break;
            case 2:
                $nextReview->modify('+5 minutes');
                break;
            case 3:
                $nextReview->modify('+15 minutes');
                break;
            case 4:
                $nextReview->modify('+30 minutes');
                break;
            case 5:
                $nextReview->modify('+1 hour');
                break;
        }
        return $nextReview;
    }

    public static function updateWordProgress(int $user_id, int $word_id, int $direction) : int {
        $pdo = Database::getConnection();

        // Check if progress exists
        $stmt = $pdo->prepare("SELECT repetition FROM `WordProgress` WHERE user_id = ? AND word_id = ?");
        $stmt->execute([$user_id, $word_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        if ($data) {
            if($direction < 0 && $data['repetition'] > 0){
                // If the user indicates they don't know the word and repetition is non-negative, reset to 0
                $data['repetition'] = 0;
            } else $data['repetition'] += $direction;

            // Update existing progress
            if($data['repetition'] < -5) $data['repetition'] = -5;
            if($data['repetition'] > 5) $data['repetition'] = 5;
            $nextReview = self::getNextReviewDate($data['repetition']);
            $stmt = $pdo->prepare("UPDATE `WordProgress` SET repetition = ?, next_review = ? WHERE user_id = ? AND word_id = ?");
            $stmt->execute([$data['repetition'], $nextReview->format("Y-m-d H:i:s"), $user_id, $word_id]);
        } else {
            // Insert new progress
            $nextReview = self::getNextReviewDate($direction);
            $stmt = $pdo->prepare("INSERT INTO `WordProgress` (user_id, word_id, repetition, next_review) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $word_id, $direction, $nextReview->format("Y-m-d H:i:s")]);
        }

        return $stmt->rowCount();
    }

    public static function resetProgress(int $user_id, int $set_id) : int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE wp FROM `WordProgress` wp INNER JOIN `Word` w ON wp.word_id = w.word_id WHERE wp.user_id = ? AND w.set_id = ?");
        $stmt->execute([$user_id, $set_id]);

        return $stmt->rowCount();
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
