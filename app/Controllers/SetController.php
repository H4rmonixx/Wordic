<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';
require_once __DIR__ . '/../Core/Filesystem.php';
require_once __DIR__ . '/../Core/Database.php';

require_once __DIR__ . '/../Models/Set.php';

use App\Core\Request;
use App\Core\LayoutEngine;
use App\Core\Filesystem;
use App\Core\Database;

use App\Models\Set;

class SetController {
    
    public function pageSet(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('set.html');
        return true;
    }

    public function pageSetEdit(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('setEdit.html');
        return true;
    }

    public function getSetInfo(Request $request) : bool {
        header('Content-Type: application/json');

        $set_id = $request->param('id');
        if($set_id === null){
            echo json_encode(['success' => false, 'message' => 'Set ID is required']);
            return true;
        }

        $set = Set::getByID((int)$set_id);
        if($set === null){
            echo json_encode(['success' => false, 'message' => 'Set cannot be reached']);
            return true;
        }

        echo json_encode([
            'success' => true,
            'info' => $set,
            'message' => ''
        ]);
        return true;
    }

    public function getSetWords(Request $request) : bool {
        header('Content-Type: application/json');

        $set_id = $request->param('id');
        if($set_id === null){
            echo json_encode(['success' => false, 'message' => 'Set ID is required']);
            return true;
        }

        $words = Set::getWords((int)$set_id);
        echo json_encode([
            'success' => true,
            'words' => $words,
            'message' => ''
        ]);
        return true;
    }

    public function getUserSetsCount(Request $request){
        header('Content-Type: application/json');

        $user_id = $request->param('id');
        if($user_id === null){
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return true;
        }

        echo json_encode([
            'success' => true,
            'count' => Set::getCountByUserID(
                (int)$user_id,
                $request->param("public_only", true)
            ),
            'message' => ''
        ]);
        return true;
    }
    
    public function getUserSets(Request $request) : bool {
        header('Content-Type: application/json');

        $user_id = $request->param('id');
        if($user_id === null){
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return true;
        }

        $paginationData = $request->json() ?? [];
        
        echo json_encode([
            'success' => true,
            'sets' => Set::getByUserID(
                (int)$user_id,
                $request->param("public_only", true),
                $paginationData['page'] ?? null,
                $paginationData['limit'] ?? null
            ),
            'message' => ''
        ]);
        return true;
    }

    public function editInfo(Request $request) : bool {
        header('Content-Type: application/json');

        $set_id = $request->param('id');
        if($set_id === null){
            echo json_encode(['success' => false, 'message' => 'Set ID is required']);
            return true;
        }

        $data = [];
        $data['name'] = $_POST['name'] ?? null;
        $data['description'] = $_POST['description'] ?? null;
        $data['public'] = $_POST['public'] ?? null;

        if($data['name'] === null || $data['description'] === null || $data['public'] === null){
            echo json_encode(['success' => false, 'message' => 'Not enough data']);
            return true;
        }

        Set::editInfo($set_id, $data);

        echo json_encode(['success' => true, 'message' => '']);
        return true;
    }

    public function editImage(Request $request) : bool {
        header('Content-Type: application/json');

        $set_id = $request->param('id');
        if($set_id === null){
            echo json_encode(['success' => false, 'message' => 'Set ID is required']);
            return true;
        }

        $file = $request->file("image");
        if($file == null || $file['error'] !== UPLOAD_ERR_OK){
            echo json_encode(['success' => false, 'message' => 'Image file not found']);
            return true;
        }

        $uploadDirectory = __DIR__ . '/../../public_html' . Set::$image_directory;
        if(substr($uploadDirectory, -1) !== '/') $uploadDirectory .= '/';

        $result = Filesystem::saveImageMinimalized($file, $uploadDirectory);
        if($result['success']){

            $oldImageData = Set::getImage($set_id);
            $oldFullPath = __DIR__ . '/../../public_html' . $oldImageData['image_path'];
            if(file_exists($oldFullPath) && is_file($oldFullPath)){
                unlink($oldFullPath);
            }

            $result['image_path'] = Set::$image_directory . $result['filename'];
            Set::editImage($set_id, $result['filename']);

        }

        echo json_encode($result);
        return true;
    }

    public function editWords(Request $request) : bool {
        header('Content-Type: application/json');

        $set_id = $request->param('id');
        if($set_id === null){
            echo json_encode(['success' => false, 'message' => 'Set ID is required']);
            return true;
        }

        $new_words = $request->json();
        if($new_words === null){
            echo json_encode(['success' => false, 'message' => 'Words list is required']);
            return true;
        }
        $old_words = Set::getWords($set_id);

        $old_keys = [];
        foreach($old_words as $w){
            $key = $w['term'] . '|' . $w['definition'];
            $old_keys[$key] = true;
        }

        $new_keys = [];
        foreach($new_words as $w){
            $key = $w['term'] . '|' . $w['definition'];
            $new_keys[$key] = true;
        }

        Database::startTransaction();

        foreach($new_words as $w){
            $key = $w['term'] . '|' . $w['definition'];
            if(!isset($old_keys[$key])){
                if(Set::addWord($set_id, $w['term'], $w['definition']) <= 0){
                    Database::rollbackTransaction();
                    echo json_encode(['success' => false, 'message' => 'Unknown error']);
                    return true;
                }
            }
        }

        foreach($old_words as $w){
            $key = $w['term'] . '|' . $w['definition'];
            if(!isset($new_keys[$key])){
                if(Set::deleteWord($w['word_id']) <= 0){
                    Database::rollbackTransaction();
                    echo json_encode(['success' => false, 'message' => 'Unknown error']);
                    return true;
                }
            }
        }

        Database::commitTransaction();

        echo json_encode(['success' => true, 'message' => '']);
        return true;
    }
    
}