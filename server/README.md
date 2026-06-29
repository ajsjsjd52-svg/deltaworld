# 🎮 Deltaworld Backend Server

Backend сервер с RCON, Telegram ботом и API для фронтенда.

## 📁 Структура

```
server/
├── config/               ← Все настройки в JSON файлах
│   ├── rcon.json        ← RCON подключение
│   ├── server.json      ← Настройки API и сервера
│   ├── ranks.json       ← Привилегии (донаты)
│   ├── services.json    ← Услуги (размут, разбан, релики)
│   └── telegram.json    ← Telegram бот
├── index.js             ← Главный файл сервера
├── package.json
└── .env                 ← Секретные данные
```

## 🚀 Установка

```bash
cd server
npm install
```

## ⚙️ Настройка

### 1. Настройте RCON

Откройте `config/rcon.json`:

```json
{
  "host": "localhost",      ← IP вашего Minecraft сервера
  "port": 25575,            ← RCON порт
  "password": "пароль",     ← RCON пароль
  "timeout": 5000
}
```

### 2. Настройте привилегии

Откройте `config/ranks.json` и измените команды под ваш плагин прав:

**Для LuckPerms:**
```json
"command": "lp user {nickname} parent set hero"
```

**Для PermissionsEx:**
```json
"command": "pex user {nickname} group set hero"
```

### 3. Настройте услуги

Откройте `config/services.json`:

```json
{
  "services": {
    "unmute": {
      "command": "unmute {nickname}"  ← Ваша команда размута
    },
    "unban": {
      "command": "pardon {nickname}"  ← Ваша команда разбана
    }
  },
  "relics": {
    "command": "eco give {nickname} {amount}"  ← Команда выдачи реликов
  }
}
```

### 4. Настройте Telegram бота

Откройте `config/telegram.json`:

```json
{
  "bot": {
    "token": "ваш_токен_здесь"
  }
}
```

## 🏃 Запуск

### Обычный запуск:
```bash
npm start
```

### С автоперезагрузкой (для разработки):
```bash
npm run dev
```

## 📡 API Endpoints

После запуска доступны:

- `GET /api/health` - Статус сервера
- `GET /api/ranks` - Список всех привилегий
- `GET /api/services` - Список услуг
- `GET /api/server-status` - Статус Minecraft сервера

### Примеры:

**Получить привилегии:**
```bash
curl http://localhost:3001/api/ranks
```

**Статус сервера:**
```bash
curl http://localhost:3001/api/server-status
```

## 🤖 Telegram бот

Бот работает в режиме `polling` (постоянное подключение).

### Проверка работы:

1. Запустите сервер: `npm start`
2. Откройте бота: [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)
3. Напишите `/start`

## 🔧 Изменение цен

Откройте `config/ranks.json` и измените:

```json
{
  "hero": {
    "price": 9,      ← Цена в рублях
    "stars": 9       ← Цена в Telegram Stars
  }
}
```

## 🔐 Безопасность

**Не публикуйте в Git:**
- `.env` файл
- `config/rcon.json` с реальным паролем
- `config/telegram.json` с реальным токеном

**Для production:**
1. Используйте переменные окружения в `.env`
2. Не комитьте секретные данные в репозиторий

## 🌍 Деплой на VPS

### 1. Загрузите на сервер:

```bash
scp -r server/ root@your-vps:/root/deltaworld-backend
```

### 2. Установите зависимости:

```bash
cd /root/deltaworld-backend
npm install
```

### 3. Используйте PM2:

```bash
npm install -g pm2
pm2 start index.js --name deltaworld-backend
pm2 startup
pm2 save
```

### 4. Просмотр логов:

```bash
pm2 logs deltaworld-backend
```

## 📝 Логи

В консоли вы увидите:

```
📁 Конфигурации загружены:
  ✓ RCON: localhost:25575
  ✓ Привилегий: 9
  ✓ Услуг: 2
  ✓ Telegram бот: DeltaPayment_bot

🚀 Backend сервер запущен на http://localhost:3001
🤖 Telegram бот @DeltaPayment_bot работает (polling mode)

📋 Доступные endpoints:
   GET  /api/health         - Статус сервера
   GET  /api/ranks          - Список привилегий
   GET  /api/services       - Список услуг
   GET  /api/server-status  - Статус Minecraft сервера
```

## 🐛 Troubleshooting

### Бот не отвечает

Проверьте токен в `config/telegram.json` или `.env`

### RCON не работает

1. Проверьте настройки в `config/rcon.json`
2. Убедитесь что RCON включен в `server.properties`
3. Проверьте что порт открыт в файрволле

### Ошибка "Cannot find module"

```bash
npm install
```

---

✅ Теперь все настройки в файлах конфигурации!
