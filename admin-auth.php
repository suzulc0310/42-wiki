<?php
// Защита от перебора паролей
session_start();

// Блокировка после 5 неудачных попыток на 15 минут
$max_attempts = 5;
$lockout_time = 900; // 15 минут

$ip = $_SERVER['REMOTE_ADDR'];
$attempts_key = 'login_attempts_' . $ip;

if (!isset($_SESSION[$attempts_key])) {
    $_SESSION[$attempts_key] = ['count' => 0, 'first_attempt' => time()];
}

// Проверка блокировки
$attempts = $_SESSION[$attempts_key];
if ($attempts['count'] >= $max_attempts && (time() - $attempts['first_attempt']) < $lockout_time) {
    $wait = ceil(($lockout_time - (time() - $attempts['first_attempt'])) / 60);
    header('Location: admin-login.php?error=Слишком много попыток. Подождите ' . $wait . ' минут');
    exit;
}

// Сброс попыток после успешного входа
$ADMIN_PASSWORD_HASH = '$2y$10$931zrI4w0SpoY1AtlvVlIOSC0j3xlAajGM2Plo2fvJCMRSxSmgJpa'; // Сгенерируйте один раз и сохраните

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    
    if (password_verify($password, $ADMIN_PASSWORD_HASH)) {
        // Успешный вход — сбрасываем попытки
        unset($_SESSION[$attempts_key]);
        
        // Обновляем ID сессии для защиты от фиксации
        session_regenerate_id(true);
        
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_auth_time'] = time();
        $_SESSION['admin_ip'] = $ip;
        $_SESSION['admin_user_agent'] = $_SERVER['HTTP_USER_AGENT'];
        
        header('Location: admin.php');
        exit;
    } else {
        // Неудачная попытка
        $_SESSION[$attempts_key]['count']++;
        if ($_SESSION[$attempts_key]['count'] === 1) {
            $_SESSION[$attempts_key]['first_attempt'] = time();
        }
        header('Location: admin-login.php?error=1');
        exit;
    }
}

header('Location: admin-login.php');
exit;
?>