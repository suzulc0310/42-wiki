<?php
session_start();
header('Content-Type: application/json');

require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Нет данных']);
    exit;
}

$char_id = $input['id'] ?? '';
$title = $input['title'] ?? '';
$real_name = $input['required']['name'] ?? '';
$birth_date = $input['required']['birthDate'] ?? '';
$city = $input['required']['city'] ?? '';
$squad = $input['required']['squad'] ?? '';
$brand_color = $input['required']['color'] ?? '#c91e1e';
$quote = $input['required']['quote'] ?? '';
$description = $input['required']['description'] ?? '';
$height_weight = $input['info']['heightWeight'] ?? '';
$image_type = $input['info']['image'] ?? '';
$activity = $input['info']['activity'] ?? '';

$styles = !empty($input['styles']) ? json_encode($input['styles'], JSON_UNESCAPED_UNICODE) : null;
$images_map = json_encode($input['images'] ?? [], JSON_UNESCAPED_UNICODE);
$socials = json_encode($input['socials'] ?? [], JSON_UNESCAPED_UNICODE);
$sections = json_encode($input['sections'] ?? [], JSON_UNESCAPED_UNICODE);
$gallery = json_encode($input['gallery'] ?? [], JSON_UNESCAPED_UNICODE);
$image_focus = $input['image_focus'] ?? 'center 50%';
$image_size = $input['image_size'] ?? 'cover';
$status = $input['status'] ?? 'pending';

$sql = "
    INSERT INTO characters (
        char_id, entity_type, title, real_name, birth_date, city, squad,
        brand_color, quote, description, height_weight, image_type, activity,
        styles, images_map, socials, sections, gallery, image_focus, image_size, status
    ) VALUES (?, 'character', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        real_name = VALUES(real_name),
        birth_date = VALUES(birth_date),
        city = VALUES(city),
        squad = VALUES(squad),
        brand_color = VALUES(brand_color),
        quote = VALUES(quote),
        description = VALUES(description),
        height_weight = VALUES(height_weight),
        image_type = VALUES(image_type),
        activity = VALUES(activity),
        styles = VALUES(styles),
        images_map = VALUES(images_map),
        socials = VALUES(socials),
        sections = VALUES(sections),
        gallery = VALUES(gallery),
        image_focus = VALUES(image_focus),
        image_size = VALUES(image_size),
        status = VALUES(status)
";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssssssssssssssssss",
    $char_id, $title, $real_name, $birth_date, $city, $squad,
    $brand_color, $quote, $description, $height_weight, $image_type, $activity,
    $styles, $images_map, $socials, $sections, $gallery, $image_focus, $image_size, $status
);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error]);
}
?>