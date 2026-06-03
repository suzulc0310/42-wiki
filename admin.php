<?php
session_start();

if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
    header('Location: admin-login.php');
    exit;
}
if ($_SESSION['admin_ip'] !== $_SERVER['REMOTE_ADDR'] || 
    $_SESSION['admin_user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
    session_destroy();
    header('Location: admin-login.php');
    exit;
}

if (isset($_SESSION['admin_auth_time']) && (time() - $_SESSION['admin_auth_time'] > 3600)) {
    session_destroy();
    header('Location: admin-login.php');
    exit;
}
session_regenerate_id(true);
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Админ-панель | 42 вики</title>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script>
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12') e.preventDefault();
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) e.preventDefault();
        });
        
        function logout() {
            window.location.href = 'admin-logout.php';
        }
    </script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, rgba(201,30,30,0.6) 0%, rgba(201,30,30,0.3) 100%);
            background-image: url('res/fon.5.png');
            background-attachment: fixed;
            font-family: "Pangolin", cursive;
            min-height: 100vh;
            padding: 20px;
        }
        
        .admin-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 25px;
            box-shadow: 0 15px 45px rgba(0,0,0,0.2);
            border: 2px solid rgba(201,30,30,0.3);
            overflow: hidden;
        }
        
        .admin-header {
            background: #c91e1e;
            padding: 20px 30px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .admin-header h1 {
            font-size: 24px;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid white;
            padding: 8px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .admin-content {
            padding: 30px;
        }
        
        h2, h3 {
            color: #c91e1e;
            margin-bottom: 15px;
        }
        
        .character-list {
            background: #f8f8f8;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-family: "Pangolin", cursive;
            transition: all 0.3s;
        }
        
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #c91e1e;
            box-shadow: 0 0 0 3px rgba(201,30,30,0.1);
        }
        
        .form-row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .btn-publish {
            background: #c91e1e;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
            font-size: 16px;
        }
        
        .btn-draft {
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
            font-size: 16px;
        }
        
        .btn-view {
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
            font-size: 16px;
        }
        
        .btn-export {
            background: #17a2b8;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
            font-size: 16px;
        }
        
        .btn-new {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-family: "Pangolin", cursive;
        }
        
        .btn-add {
            background: #6c757d;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .image-style-item {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
        }
        
        .section-item {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            position: relative;
        }
        
        .section-handle {
            cursor: move;
            color: #999;
            margin-right: 10px;
        }
        
        .section-handle:hover {
            color: #c91e1e;
        }
        
        .text-toolbar {
            display: flex;
            gap: 5px;
            margin-bottom: 8px;
        }
        
        .text-toolbar button {
            background: #e0e0e0;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .text-toolbar button:hover {
            background: #c91e1e;
            color: white;
        }
        
        hr {
            margin: 20px 0;
            border: none;
            border-top: 1px solid #e0e0e0;
        }
        
        .character-select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-family: "Pangolin", cursive;
            font-size: 16px;
            background: white;
            cursor: pointer;
        }
        
        .select2-container .select2-selection--single {
            height: 45px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-family: "Pangolin", cursive;
        }
        
        .select2-container--default .select2-selection--single .select2-selection__rendered {
            line-height: 40px;
            padding-left: 15px;
        }
        
        .select2-container--default .select2-selection--single .select2-selection__arrow {
            height: 40px;
        }
        .character-result:hover {
            background: rgba(201,30,30,0.1);
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <h1>📝 Управление персонажами — 42 вики</h1>
            <button class="logout-btn" onclick="logout()">Выйти</button>
        </div>
        
        <div class="admin-content">
            <div class="character-list">
                <h2>📋 Список персонажей</h2>
                <input type="text" id="character-search" placeholder="🔍 Поиск персонажа..." style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 10px; border: 2px solid #e0e0e0;">
                <select id="character-select" style="width: 100%; margin-bottom: 15px;">
                    <option value="">-- Выберите персонажа --</option>
                </select>
                <button class="btn-new" onclick="createNewCharacter()">➕ Новый персонаж</button>
            </div>
            
            <form id="character-form">
                <h2>✏️ Редактирование персонажа</h2>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>ID (уникальный, латиницей):</label>
                        <input type="text" id="char-id" required pattern="[a-z0-9-]+" placeholder="bucefal">
                    </div>
                    <div class="form-group">
                        <label>Имя персонажа:</label>
                        <input type="text" id="char-title" required placeholder="Буцефал">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Настоящее имя:</label>
                        <input type="text" id="char-name" placeholder="Тихон">
                    </div>
                    <div class="form-group">
                        <label>Дата рождения:</label>
                        <input type="text" id="char-birth" placeholder="5 апреля 2009г.">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Город(а) (через запятую, если несколько):</label>
                        <input type="text" id="char-city" placeholder="Москва, Тутаев">
                    </div>
                    <div class="form-group">
                        <label>Сквад:</label>
                        <input type="text" id="char-squad" placeholder="Селюки сквад">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Цвет (hex):</label>
                        <input type="color" id="char-color" value="#c91e1e">
                    </div>
                    <div class="form-group">
                        <label>Рост и вес:</label>
                        <input type="text" id="char-height-weight" placeholder="180/55">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Образ:</label>
                        <input type="text" id="char-image-type" placeholder="Мусорный воин">
                    </div>
                    <div class="form-group">
                        <label>Род деятельности:</label>
                        <input type="text" id="char-activity" placeholder="Контентмейкер">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Цитата:</label>
                    <textarea id="char-quote" rows="2" placeholder="..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Описание:</label>
                    <textarea id="char-description" rows="4" placeholder="Краткое описание персонажа..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Стили (каждый с новой строки):</label>
                    <textarea id="char-styles" rows="3" placeholder="Дефолт&#10;F5lay&#10;Шуба"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Ссылки на фото (галерея, по одной на строку):</label>
                    <textarea id="char-gallery" rows="4" placeholder="https://..."></textarea>
                </div>
                
                <div class="form-group">
                    <h3>🖼️ Изображения для стилей</h3>
                    <div id="images-container"></div>
                    <button type="button" class="btn-add" onclick="addImageStyleField()">➕ Добавить поле для стиля</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>📐 Позиция фокуса изображения:</label>
                        <select id="image_focus">
                            <option value="center 50%">По центру</option>
                            <option value="top 20%">Верх (20%)</option>
                            <option value="top 30%">Верх (30%)</option>
                            <option value="top 40%">Верх (40%)</option>
                            <option value="center 30%">Центр со смещением вверх</option>
                            <option value="center 40%">Центр со смещением вниз</option>
                            <option value="bottom 70%">Низ (70%)</option>
                            <option value="bottom 80%">Низ (80%)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>📏 Режим вписывания:</label>
                        <select id="image_size">
                            <option value="cover">Обрезать (cover)</option>
                            <option value="contain">Вписать целиком (contain)</option>
                            <option value="fill">Растянуть (fill)</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Соцсети (формат: название:ссылка, каждая с новой строки):</label>
                    <textarea id="char-socials" rows="3" placeholder="telegram:https://t.me/...&#10;vk:https://vk.com/..."></textarea>
                </div>
                
                <div class="form-group">
                    <h3>📑 Секции контента</h3>
                    <div id="sections-container"></div>
                    <button type="button" class="btn-add" onclick="addSection()">➕ Добавить секцию</button>
                </div>
                
                <hr>
                
                <div class="action-buttons">
                    <button type="submit" name="action" value="publish" class="btn-publish">📢 Опубликовать</button>
                    <button type="submit" name="action" value="draft" class="btn-draft">📝 Черновик</button>
                    <button type="button" class="btn-view" onclick="viewCharacterPage()">👁️ Просмотр</button>
                    <button type="button" class="btn-export" onclick="exportCharacter()">📤 Экспорт JSON</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="js/admin.js"></script>
</body>
</html>