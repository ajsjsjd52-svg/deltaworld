# 🚀 Быстрый старт - Deltaworld

## Установка и запуск

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте .env файл

Откройте файл `.env` и настройте:

```env
PORT=3000
RCON_HOST=localhost
RCON_PORT=25575
RCON_PASSWORD=ваш_rcon_пароль
MC_SERVER_IP=localhost
MC_SERVER_PORT=25565

# Telegram Bot
TELEGRAM_BOT_TOKEN=8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU
```

### 3. Запустите сервер

**Способ 1 - Через npm:**
```bash
npm start
```

**Способ 2 - Двойной клик:**
Откройте файл `start-all.bat`

### 4. Откройте сайт

Перейдите в браузере: http://localhost:3000

---

## ✅ Что запускается

При запуске `npm start` или `start-all.bat` запускаются **одновременно**:

1. 🌐 **Веб-сайт** на http://localhost:3000
2. 🤖 **Telegram бот** @DeltaPayment_bot

---

## 🎮 Как это работает

### Покупка через сайт:

1. Пользователь заходит на сайт
2. Выбирает донат/услугу/релики
3. Вводит свой никнейм
4. Выбирает способ оплаты:
   - 💳 Карты МИР
   - 🌍 Зарубежные карты
   - ⭐ **Telegram Stars** (автоматическая выдача!)
   - 💰 СБП, ЮMoney, и другие

### Оплата через Telegram Stars:

1. Пользователь выбирает "Telegram Stars"
2. Нажимает кнопку "Открыть бота"
3. **Бот сразу показывает:**
   - 📦 Что покупает
   - 👤 Никнейм
   - 💰 Сумму в звездах
4. Кнопка "Pay X⭐" - оплачивает
5. **Товар выдается автоматически через RCON!** ✅

---

## ⚙️ Настройка команд

### Команды привилегий

Откройте `server.js` и найдите объект `RANKS` (в конце файла):

```javascript
const RANKS = {
    'hero': { 
        name: 'HERO', 
        price: 9, 
        stars: 9, 
        command: 'lp user {nickname} parent set hero'  // ← Измените здесь
    },
    // ...
};
```

**Для разных плагинов прав:**

- **LuckPerms:** `lp user {nickname} parent set hero`
- **PermissionsEx:** `pex user {nickname} group set hero`
- **GroupManager:** `manuadd {nickname} hero`

### Команды услуг

Найдите объект `SERVICES`:

```javascript
const SERVICES = {
    'unmute': { 
        name: 'Размут', 
        price: 15, 
        stars: 15, 
        command: 'unmute {nickname}'  // ← Ваша команда
    },
    'unban': { 
        name: 'Разбан', 
        price: 150, 
        stars: 150, 
        command: 'unban {nickname}'  // ← Ваша команда
    }
};
```

### Команда для реликов

Найдите в коде:

```javascript
command = `eco give ${payload.nickname} ${payload.amount}`;
```

Замените на вашу команду:
- **EssentialsX:** `eco give {nickname} {amount}`
- **CMI:** `give {nickname} money {amount}`
- **PlayerPoints:** `points give {nickname} {amount}`

---

## 💰 Курс оплаты Telegram Stars

- **1 ⭐ = 1 рубль** (донаты и услуги)
- **1 ⭐ = 5 реликов**

### Примеры цен:

| Товар | Цена | Звезды |
|-------|------|--------|
| HERO | 9₽ | 9⭐ |
| GOD | 999₽ | 999⭐ |
| Размут | 15₽ | 15⭐ |
| Разбан | 150₽ | 150⭐ |
| 100 реликов | 20₽ | 20⭐ |

---

## 🔧 Настройка Telegram Stars

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/mybots`
3. Выберите `@DeltaPayment_bot`
4. Нажмите **Payments**
5. Выберите **Telegram Stars**
6. Готово! ✅

---

## 📁 Структура файлов

```
simpleunlocker_release/
├── server.js              ← Веб-сервер + Telegram бот (все в одном!)
├── telegram-bot.js        ← Старый файл (не используется)
├── start-all.bat          ← Запуск на Windows
├── package.json
├── .env                   ← Настройки RCON и бота
├── public/
│   ├── index.html         ← Главная страница
│   ├── payment.html       ← Страница оплаты
│   ├── styles.css
│   ├── payment.css
│   ├── script.js
│   └── payment.js
└── logo.png               ← Ваш логотип
```

---

## 🐛 Решение проблем

### Бот не отвечает

1. Проверьте токен в `.env`
2. Убедитесь что сервер запущен (`npm start`)
3. Проверьте логи в консоли

### RCON не работает

1. Проверьте настройки в `.env`
2. Убедитесь что RCON включен в `server.properties`:
   ```properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=ваш_пароль
   ```
3. Перезапустите Minecraft сервер

### Покупка не выдается

1. Проверьте команды в `server.js` (RANKS, SERVICES)
2. Проверьте RCON подключение
3. Проверьте логи в консоли

---

## 🚀 Production (запуск 24/7)

### На Windows:

Используйте планировщик задач или запустите в фоне

### На Linux (VPS):

```bash
# Установите PM2
npm install -g pm2

# Запустите
pm2 start server.js --name deltaworld

# Автозапуск при перезагрузке
pm2 startup
pm2 save

# Просмотр логов
pm2 logs deltaworld
```

---

## 📞 Контакты

- **Бот:** [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)
- **Сервер:** play.deltaworld.ru

---

✅ **Готово!** Теперь запустите `npm start` и все заработает!
