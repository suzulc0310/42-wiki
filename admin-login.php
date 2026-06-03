<?php
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Вход в админку | 42 вики</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, rgba(201,30,30,0.7) 0%, rgba(201,30,30,0.4) 100%);
            background-image: url('res/fon.5.png');
            background-attachment: fixed;
            font-family: "Pangolin", cursive;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 25px;
            width: 380px;
            text-align: center;
            box-shadow: 0 15px 45px rgba(0,0,0,0.2);
            border: 2px solid rgba(201,30,30,0.3);
        }
        .login-logo { width: 100px; margin-bottom: 20px; }
        h1 { color: #c91e1e; font-size: 28px; margin-bottom: 25px; }
        input {
            width: 100%;
            padding: 12px 15px;
            margin-bottom: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 16px;
            font-family: "Pangolin", cursive;
        }
        input:focus { outline: none; border-color: #c91e1e; }
        button {
            width: 100%;
            padding: 12px;
            background: #c91e1e;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
        }
        button:hover { background: #a01818; }
        .error { color: #c91e1e; margin-top: 15px; font-size: 14px; }
        .hint { margin-top: 25px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="login-container">
        <img src="res/logo_Square.png" alt="42 вики" class="login-logo">
        <h1>🔐 Вход в админ-панель</h1>
        <form method="POST" action="admin-auth.php">
            <input type="password" name="password" placeholder="Введите пароль" autofocus>
            <button type="submit">Войти</button>
        </form>
        
        <?php if (isset($_GET['error'])): ?>
            <div class="error">❌ Неверный пароль</div>
        <?php endif; ?>
        
        <div class="hint">Доступ только для авторизованных лиц</div>
        <div class="hint">
            <a id="elem" href="javascript:window.history.back();" style="color: #c91e1e; text-decoration: none;">← Вернуться на сайт</a>
        </div>
    </div>
</body>
</html>