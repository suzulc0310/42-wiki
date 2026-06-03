<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    $type = $_GET['type'] ?? 'character';
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] == 1;
    $statusFilter = $isAdmin ? "" : "AND status = 'published'";
    
    $sql = "SELECT char_id, title, city, squad, images_map, status FROM characters WHERE entity_type = ? $statusFilter ORDER BY title ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $firstImage = null;
        $imagesMap = json_decode($row['images_map'], true);
        if ($imagesMap && is_array($imagesMap)) {
            $firstStyle = array_key_first($imagesMap);
            if ($firstStyle && !empty($imagesMap[$firstStyle])) {
                $firstImage = $imagesMap[$firstStyle][0];
            }
        }
        
        $city = $row['city'] ?? 'Неизвестно';
        if (strpos($city, ',') !== false) {
            $city = array_map('trim', explode(',', $city));
        }
        
        $name = $row['title'];
        if ($isAdmin && $row['status'] === 'pending') {
            $name .= ' 📝';
        }
        
        $data[] = [
            "id" => $row['char_id'], 
            "name" => $name,
            "city" => $city,
            "squad" => $row['squad'] ?? 'Нет',
            "image" => $firstImage,
            "status" => $row['status']
        ];
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>