# 🤖 Telegram Бот для оплаты Stars

## Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. Запуск

**Только бот:**
```bash
npm run bot
```

**Или двойной клик на файл:**
- `start-bot.bat` - только бот
- `start-all.bat` - сайт + бот вместе

### 3. Использование

Откройте бота: [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)

---

## 💰 Курс оплаты

- **1 ⭐ = 1 рубль** (донаты и услуги)
- **1 ⭐ = 5 реликов**

### Примеры:

- Привилегия HERO (9₽) = **9 звезд** ⭐
- Привилегия GOD (999₽) = **999 звезд** ⭐
- Размут (15₽) = **15 звезд** ⭐
- Разбан (150₽) = **150 звезд** ⭐
- 100 реликов = **20 звезд** ⭐
- 1000 реликов = **200 звезд** ⭐

---

## 🎮 Как работает

1. Пользователь открывает [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)
2. Выбирает донат/услугу/релики
3. Вводит свой игровой никнейм
4. Оплачивает Telegram Stars
5. **Товар выдается автоматически через RCON!** ✅

---

## ⚙️ Настройка команд

Откройте `telegram-bot.js` и найдите:

### Команды привилегий:

```javascript
const RANKS = {
    'hero': { 
        command: 'lp user {nickname} parent set hero' 
    },
};
```

Замените на свою систему прав:
- **LuckPerms:** `lp user {nickname} parent set hero`
- **PermissionsEx:** `pex user {nickname} group set hero`

### Команда для реликов:

Найдите строку:
```javascript
command = `give ${payload.nickname} relics ${payload.amount}`;
```

Замените на вашу команду:
- `eco give ${payload.nickname} ${payload.amount}`
- `money give ${payload.nickname} ${payload.amount}`
- Или вашу кастомную команду

---

## 🔧 Настройка в BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите `@DeltaPayment_bot`
3. Нажмите **Payments**
4. Выберите **Telegram Stars**
5. Готово! ✅

---

## 📋 Донат привилегии

| Ранг | Цена | Звезды |
|------|------|--------|
| HERO | 9₽ | 9⭐ |
| TITAN | 17₽ | 17⭐ |
| AVENGER | 25₽ | 25⭐ |
| OVERLORD | 50₽ | 50⭐ |
| MINISTER | 115₽ | 115⭐ |
| IMPERATOR | 199₽ | 199⭐ |
| DAEMON | 359₽ | 359⭐ |
| COBRA | 599₽ | 599⭐ |
| GOD | 999₽ | 999⭐ |

## 🛠 Услуги

| Услуга | Цена | Звезды |
|--------|------|--------|
| Размут | 15₽ | 15⭐ |
| Разбан | 150₽ | 150⭐ |

## 💎 Релики

| Количество | Цена | Звезды |
|------------|------|--------|
| 50 реликов | 10₽ | 10⭐ |
| 100 реликов | 20₽ | 20⭐ |
| 500 реликов | 100₽ | 100⭐ |
| 1000 реликов | 200₽ | 200⭐ |
| 5000 реликов | 1000₽ | 1000⭐ |
| 10000 реликов | 2000₽ | 2000⭐ |

---

## ❓ FAQ

**Q: Как купить Telegram Stars?**
A: В любом канале с платным контентом → "Купить Stars" → выберите количество

**Q: Товар не пришел?**
A: Проверьте:
1. RCON настроен правильно в `.env`
2. Сервер запущен
3. Никнейм введен правильно

**Q: Как изменить цены?**
A: Измените значения `price` и `stars` в `telegram-bot.js`

**Q: Можно ли добавить свои товары?**
A: Да! Добавьте новый объект в `RANKS` или `SERVICES`

---

## 🚀 Запуск в production

### На Windows:
```bash
start-all.bat
```

### На Linux:
```bash
pm2 start server.js --name deltaworld-web
pm2 start telegram-bot.js --name deltaworld-bot
pm2 save
```

---

## 📞 Контакты

- **Бот:** [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)
- **Сервер:** play.deltaworld.ru
- **Поддержка:** @deltaworld_admin

---

✅ Готово! Теперь ваши игроки могут покупать донаты через Telegram Stars!
