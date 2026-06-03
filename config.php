<?php
$isLocal = ($_SERVER['REMOTE_ADDR'] == '127.0.0.1' || $_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '42wiki');

if ($isLocal) {
    define('DB_HOST', 'localhost');
    define('DB_NAME', '42wiki_db');
    define('DB_USER', 'root');
    define('DB_PASS', '');
} else {
    // ДАННЫЕ ОТ INFINITYFREE
    define('DB_HOST', 'sqlXXX.infinityfree.com');
    define('DB_NAME', 'if0_XXXXXX_42wiki');
    define('DB_USER', 'if0_XXXXXX');
    define('DB_PASS', 'ваш_пароль');
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die("Ошибка подключения: " . $conn->connect_error);
}
?>