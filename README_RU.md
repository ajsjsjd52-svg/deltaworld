# Deltaworld - Сайт для Minecraft сервера

## Описание

Классический минималистичный сайт для вашего Minecraft сервера с автоматической системой доната.

### Основные возможности
- Отображение статуса сервера и игроков онлайн
- Система привилегий (9 донат-рангов)
- Автоматическая выдача привилегий через RCON после оплаты
- Классический темный дизайн без излишеств

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка .env
Отредактируйте файл `.env`:
```
RCON_HOST=localhost
RCON_PORT=25575
RCON_PASSWORD=ваш_пароль
MC_SERVER_IP=play.deltaworld.ru
MC_SERVER_PORT=25565
```

### 3. Настройка MC сервера
В `server.properties`:
```
enable-rcon=true
rcon.port=25575
rcon.password=ваш_пароль
```

### 4. Установите плагин прав
Установите на сервер:
- LuckPerms (рекомендуется)
- PermissionsEx
- GroupManager

Создайте группы: hero, titan, avenger, overlord, minister, imperator, daemon, cobra, god

### 5. Запуск
```bash
npm start
```
Откройте http://localhost:3000

## Как работает донат

```
Игрок → Выбирает привилегию → Вводит никнейм → Оплачивает 
    ↓
Платежная система → Webhook на ваш сервер → RCON команда
    ↓
Привилегия автоматически выдана!
```

## Привилегии

| Ранг | Цена |
|------|------|
| HERO | 9₽ |
| TITAN | 17₽ |
| AVENGER | 25₽ |
| OVERLORD | 50₽ |
| MINISTER | 115₽ |
| IMPERATOR | 199₽ |
| DAEMON | 359₽ |
| COBRA | 599₽ |
| GOD | 999₽ |

## API для выдачи привилегий

**POST /api/grant-privilege**

Запрос:
```json
{
  "nickname": "Player123",
  "rank": "hero"
}
```

Ответ:
```json
{
  "success": true,
  "message": "Привилегия hero успешно выдана игроку Player123"
}
```

## Настройка команды выдачи

В файле `server.js` измените под ваш плагин:

**LuckPerms:**
```javascript
const command = `lp user ${nickname} parent set ${rank}`;
```

**PermissionsEx:**
```javascript
const command = `pex user ${nickname} group set ${rank}`;
```

**GroupManager:**
```javascript
const command = `manuadd ${nickname} ${rank}`;
```

## Настройка платежной системы

Откройте `public/script.js` и измените функцию `openDonate()`:

### Вариант 1: Telegram бот
```javascript
function openDonate(rank) {
    const nickname = prompt('Введите ваш никнейм:');
    if (nickname) {
        window.open(`https://t.me/your_bot?start=donate_${rank}_${nickname}`, '_blank');
    }
}
```

### Вариант 2: Donate.stream
```javascript
function openDonate(rank) {
    const nickname = prompt('Введите ваш никнейм:');
    if (nickname) {
        window.open(`https://donate.stream/your_channel?amount=${rankPrices[rank]}&message=${nickname}_${rank}`, '_blank');
    }
}
```

### Вариант 3: Полная интеграция
Смотрите `PAYMENT_SETUP.md`

## Кастомизация

### Изменить цвета
`public/styles.css`:
```css
:root {
    --primary: #4a9eff;    /* Основной цвет */
    --bg-dark: #1a1a1a;    /* Фон */
}
```

### Изменить привилегии
`public/index.html` - найдите секцию donate и отредактируйте HTML

### Изменить название сервера
`public/index.html` - замените "DELTAWORLD" на ваше название

## Документация

- `START.md` - Быстрый старт
- `PAYMENT_SETUP.md` - Настройка оплаты (подробно)
- `DEPLOYMENT.md` - Развертывание на VPS
- `FINAL_CHANGES.md` - Что изменилось в последней версии

## Требования

- Node.js 14+
- Minecraft сервер с RCON
- Плагин прав (LuckPerms/PermissionsEx/GroupManager)

## Поддержка

При проблемах проверьте:
1. RCON включен на MC сервере
2. Правильный пароль в .env
3. Плагин прав установлен
4. Группы созданы на сервере
5. Firewall не блокирует RCON порт

## Лицензия

MIT - используйте свободно для своих проектов
