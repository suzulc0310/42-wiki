<?php
session_start();
header('Content-Type: application/json');

// Временно отключим проверку для отладки
// if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
//     http_response_code(403);
//     echo json_encode(['error' => 'Доступ запрещён']);
//     exit;
// }

require_once '../config.php';

$id = $_GET['id'] ?? '';

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID не указан']);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM characters WHERE char_id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();
$char = $result->fetch_assoc();

if (!$char) {
    http_response_code(404);
    echo json_encode(['error' => 'Персонаж не найден: ' . $id]);
    exit;
}

$output = [
    'id' => $char['char_id'],
    'title' => $char['title'],
    'required' => [
        'name' => $char['real_name'],
        'birthDate' => $char['birth_date'],
        'city' => $char['city'],
        'squad' => $char['squad'],
        'color' => $char['brand_color'],
        'quote' => $char['quote'],
        'description' => $char['description']
    ],
    'info' => [
        'heightWeight' => $char['height_weight'],
        'image' => $char['image_type'],
        'activity' => $char['activity']
    ],
    'styles' => json_decode($char['styles'], true) ?? [],
    'images' => json_decode($char['images_map'], true) ?? [],
    'socials' => json_decode($char['socials'], true) ?? [],
    'sections' => json_decode($char['sections'], true) ?? [],
    'gallery' => json_decode($char['gallery'], true) ?? [],
    'image_focus' => $char['image_focus'] ?? 'center 50%',
    'image_size' => $char['image_size'] ?? 'cover'
];

echo json_encode($output, JSON_UNESCAPED_UNICODE);
?>