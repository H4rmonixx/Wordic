<?php

namespace App\Core;

use finfo;
use GdImage;

class Filesystem
{

    public static array $allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
    public static array $extensionsMap = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif'
    ];

    // Resize and save image
    public static function saveImageMinimalized($file, $uploadDirectory) : array {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, self::$allowedMime)) {
            return ['success' => false, 'message' => 'File is not a valid image'];
        }

        if (!getimagesize($file['tmp_name'])) {
            return ['success' => false, 'message' => 'File is not a valid image'];
        }

        $extension = self::$extensionsMap[$mimeType];

        do {
            $uniqueName = bin2hex(random_bytes(8)) . '_' . uniqid();
            $destination = $uploadDirectory . $uniqueName . "." . $extension;
        } while (file_exists($destination));

        $maxWidth = 800;
        $maxHeight = 800;
        $quality = 85;

        $srcImage = false;
        switch ($mimeType) {
            case 'image/jpeg':
                $srcImage = imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/png':
                $srcImage = imagecreatefrompng($file['tmp_name']);
                break;
            case 'image/gif':
                $srcImage = imagecreatefromgif($file['tmp_name']);
                break;
            default:
                return ['success' => false, 'message' => 'Unsupported image format'];
        }
        if (!$srcImage) {
            return ['success' => false, 'message' => 'Failed to read image'];
        }

        $width  = imagesx($srcImage);
        $height = imagesy($srcImage);

        $ratio = min($maxWidth / $width, $maxHeight / $height, 1);
        $newWidth  = (int)($width * $ratio);
        $newHeight = (int)($height * $ratio);

        $dstImage = imagecreatetruecolor($newWidth, $newHeight);
        if (in_array($mimeType, ['image/png', 'image/gif'])) {
            imagecolortransparent($dstImage, imagecolorallocatealpha($dstImage, 0, 0, 0, 127));
            imagealphablending($dstImage, false);
            imagesavealpha($dstImage, true);
        }

        imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        $result = false;
        switch ($mimeType) {
            case 'image/jpeg':
                $result = imagejpeg($dstImage, $destination, $quality);
                break;
            case 'image/png':
                $result = imagepng($dstImage, $destination, 9);
                break;
            case 'image/gif':
                $result = imagegif($dstImage, $destination);
                break;
        }

        if(!$result){
            return ['success' => false, 'message' => 'Unknown error'];
        }

        imagedestroy($srcImage);
        imagedestroy($dstImage);

        return ['success' => true, 'message' => '', "filename" => $uniqueName . "." . $extension];
    }

}
