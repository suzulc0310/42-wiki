<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? '';
$type = $_GET['type'] ?? 'character';

$stmt = $conn->prepare("SELECT * FROM characters WHERE char_id = ? AND entity_type = ? AND status = 'published'");
$stmt->bind_param("ss", $id, $type);
$stmt->execute();
$result = $stmt->get_result();
$char = $result->fetch_assoc();

if ($char) {
    $styles = json_decode($char['styles'], true);
    $images = json_decode($char['images_map'], true);
    $socials = json_decode($char['socials'], true);
    $sections = json_decode($char['sections'], true);
    $gallery = json_decode($char['gallery'], true);
    
    $city = $char['city'];
    if (is_string($city) && strpos($city, ',') !== false) {
        $city = array_map('trim', explode(',', $city));
    }
    
    $output = [
        "id" => $char['char_id'],
        "title" => $char['title'],
        "required" => [
            "name" => $char['real_name'],
            "birthDate" => $char['birth_date'],
            "city" => $city,
            "squad" => $char['squad'],
            "color" => $char['brand_color'],
            "quote" => $char['quote'],
            "description" => $char['description']
        ],
        "info" => [
            "heightWeight" => $char['height_weight'],
            "image" => $char['image_type'],
            "activity" => $char['activity']
        ],
        "styles" => $styles ?: [],
        "images" => $images ?: [],
        "socials" => $socials ?: [],
        "sections" => $sections ?: [],
        "gallery" => $gallery ?: []
    ];

    echo json_encode($output, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404);
    echo json_encode(["error" => "Персонаж не найден: $id"]);
}
?>