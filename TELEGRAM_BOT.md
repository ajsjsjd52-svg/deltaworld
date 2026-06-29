# Telegram Bot для оплаты через Telegram Stars

## 🤖 О боте

**DeltaPayment_bot** - бот для приема платежей через Telegram Stars для сервера Deltaworld.

### Возможности:
- ✅ Покупка донат привилегий (HERO - GOD)
- ✅ Покупка услуг (размут, разбан)
- ✅ Покупка реликов
- ✅ Автоматическая выдача через RCON
- ✅ Удобное меню с кнопками

### Курс оплаты:
- **1 Telegram Star = 1 рубль** (для донатов и услуг)
- **1 Telegram Star = 5 реликов**

---

## 📦 Установка

### 1. Установите зависимости

```bash
npm install
```

Это установит `node-telegram-bot-api` для работы бота.

### 2. Настройте .env файл

Токен бота уже добавлен в `.env`:

```env
TELEGRAM_BOT_TOKEN=8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU
```

### 3. Настройте команды для реликов

В файле `telegram-bot.js` найдите строку:

```javascript
command = `give ${payload.nickname} relics ${payload.amount}`;
```

Замените на вашу команду для выдачи реликов, например:
- `eco give ${payload.nickname} ${payload.amount}`
- `relics add ${payload.nickname} ${payload.amount}`
- или ваша кастомная команда

---

## 🚀 Запуск

### Запуск только бота:

```bash
npm run bot
```

### Запуск бота в режиме разработки (с автоперезагрузкой):

```bash
npm run bot:dev
```

### Запуск сайта и бота одновременно:

```bash
npm run all
```

Или в отдельных терминалах:

**Терминал 1 (сайт):**
```bash
npm start
```

**Терминал 2 (бот):**
```bash
npm run bot
```

---

## 🎮 Использование бота

### Для пользователей:

1. Открыть бота: [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)
2. Нажать `/start`
3. Выбрать категорию (донаты/услуги/релики)
4. Выбрать товар
5. Ввести игровой никнейм
6. Оплатить Telegram Stars
7. Покупка выдается автоматически

### Команды бота:

- `/start` - главное меню

---

## ⚙️ Настройка привилегий и команд

### Изменить цены донатов

В файле `telegram-bot.js` найдите объект `RANKS`:

```javascript
const RANKS = {
    'hero': { 
        name: 'HERO', 
        price: 9,           // Цена в рублях
        stars: 9,           // Цена в звездах (1:1)
        command: 'lp user {nickname} parent set hero'  // Команда RCON
    },
    // ...
};
```

### Изменить команды привилегий

Замените команду в поле `command`:

**Для LuckPerms:**
```javascript
command: 'lp user {nickname} parent set hero'
```

**Для PEX:**
```javascript
command: 'pex user {nickname} group set hero'
```

**Для PermissionsEx:**
```javascript
command: 'permissions player {nickname} setgroup hero'
```

### Изменить услуги (размут/разбан)

В файле `telegram-bot.js` найдите объект `SERVICES`:

```javascript
const SERVICES = {
    'unmute': { 
        name: 'Размут', 
        price: 15, 
        stars: 15, 
        command: 'unmute {nickname}'  // Ваша команда размута
    },
    'unban': { 
        name: 'Разбан', 
        price: 150, 
        stars: 150, 
        command: 'unban {nickname}'   // Ваша команда разбана
    }
};
```

### Изменить курс реликов

Найдите код с реликами:

```javascript
// Текущий курс: 1 звезда = 5 реликов
const stars = Math.ceil(amount / 5);
```

Измените `5` на нужное значение.

---

## 🔒 Настройка Telegram Stars в BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/mybots`
3. Выберите бота `@DeltaPayment_bot`
4. Нажмите **Payments**
5. Выберите **Telegram Stars** как провайдера
6. Готово!

---

## 📊 Система оплаты

### Как это работает:

1. **Пользователь выбирает товар** → вводит никнейм
2. **Бот создает инвойс** → пользователь оплачивает Stars
3. **Telegram подтверждает платеж** → бот получает событие
4. **Бот выполняет RCON команду** → товар выдается в игре
5. **Пользователь получает подтверждение** → покупка завершена

### Автоматическая выдача:

Бот автоматически выполняет команды через RCON:
- Привилегии → `lp user {nickname} parent set {rank}`
- Размут → `unmute {nickname}`
- Разбан → `unban {nickname}`
- Релики → `give {nickname} relics {amount}` (настройте под свою систему)

---

## 🛠 Отладка

### Проверка логов:

```bash
node telegram-bot.js
```

Логи будут показывать:
- ✅ Успешные платежи
- 📝 RCON команды
- ❌ Ошибки

### Проблемы с RCON:

Если RCON не работает:
1. Проверьте настройки в `.env`
2. Убедитесь что RCON включен в `server.properties`
3. Проверьте порт и пароль

### Проблемы с платежами:

- Убедитесь что Stars включены в BotFather
- Проверьте что токен бота правильный
- Telegram Stars работают только с реальными платежами (нет тестового режима)

---

## 💡 Дополнительные настройки

### Добавить новую привилегию:

```javascript
const RANKS = {
    // ...существующие...
    'newrank': { 
        name: 'NEWRANK', 
        price: 500, 
        stars: 500, 
        command: 'lp user {nickname} parent set newrank' 
    }
};
```

Затем добавьте кнопку в меню донатов.

### Добавить новую услугу:

```javascript
const SERVICES = {
    // ...существующие...
    'newservice': { 
        name: 'Новая услуга', 
        price: 100, 
        stars: 100, 
        command: 'yourcommand {nickname}' 
    }
};
```

---

## 📞 Поддержка

По вопросам работы бота:
- Telegram: @deltaworld_admin
- IP сервера: play.deltaworld.ru

---

## 📝 Лицензия

Бот создан для сервера Deltaworld. Свободное использование и модификация.
