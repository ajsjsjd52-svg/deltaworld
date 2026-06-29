# Deltaworld - Сайт для Minecraft сервера

Классический минималистичный сайт для Minecraft сервера с системой доната и автоматической выдачей привилегий через RCON.

## Возможности

- Информация о сервере в реальном времени
- Список игроков онлайн
- Система привилегий с 9 донат-рангами
- Автоматическая выдача привилегий через RCON
- Классический темный дизайн
- Адаптивная верстка

## Установка

1. Установите Node.js: https://nodejs.org/

2. Установите зависимости:
```bash
npm install
```

3. Настройте `.env` файл:

```
PORT=3000
RCON_HOST=localhost          # IP вашего MC сервера
RCON_PORT=25575              # RCON порт
RCON_PASSWORD=your_password  # RCON пароль
MC_SERVER_IP=localhost       # IP для показа на сайте
MC_SERVER_PORT=25565         # Порт MC сервера
```

4. Настройте RCON на MC сервере в `server.properties`:

```
enable-rcon=true
rcon.port=25575
rcon.password=ваш_пароль
```

5. Установите плагин прав на сервер (LuckPerms рекомендуется)

6. Запустите:
```bash
npm start
```

7. Откройте: http://localhost:3000

## Как работает донат

1. Игрок выбирает привилегию и вводит свой никнейм
2. Переходит на оплату (настраивается в `public/script.js`)
3. После успешной оплаты платежная система отправляет webhook на `/api/grant-privilege`
4. Сервер автоматически выдает привилегию через RCON команду

## Настройка автоматической выдачи

В `server.js` настройте команду под ваш плагин прав:

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

## API

**POST /api/grant-privilege** - Выдача привилегии
```json
{
  "nickname": "Player123",
  "rank": "hero"
}
```

**GET /api/server-status** - Статус сервера

## Документация

- `PAYMENT_SETUP.md` - настройка платежной системы
- `DEPLOYMENT.md` - развертывание на сервере

## Технологии

- Node.js + Express
- RCON для управления сервером
- Vanilla JavaScript
- CSS3

## Лицензия

MIT
