# 🚀 Загрузить на Vercel - Быстрая инструкция

## Шаг 1: Загрузите на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ваш-username/deltaworld.git
git push -u origin main
```

## Шаг 2: Зайдите на Vercel

1. Откройте [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"Add New"** → **"Project"**
4. Выберите репозиторий `deltaworld`
5. Нажмите **"Import"**

## Шаг 3: Добавьте переменные окружения

В разделе **"Environment Variables"** добавьте:

```
TELEGRAM_BOT_TOKEN = 8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU
RCON_HOST = ваш_ip_сервера
RCON_PORT = 25575
RCON_PASSWORD = ваш_rcon_пароль
MC_SERVER_IP = play.deltaworld.ru
MC_SERVER_PORT = 25565
```

## Шаг 4: Deploy

Нажмите **"Deploy"** и ждите 1-2 минуты!

## Шаг 5: Настройте Telegram Webhook

После деплоя откройте в браузере (замените `ваш-домен` на ваш):

```
https://api.telegram.org/bot8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU/setWebhook?url=https://ваш-домен.vercel.app/api/telegram-webhook
```

Должен появиться:
```json
{"ok":true,"result":true}
```

## ✅ Готово!

Теперь ваш сайт доступен на `https://ваш-домен.vercel.app`

---

## ⚠️ Важно про RCON

Vercel **не поддерживает** постоянные TCP соединения для RCON!

### Варианты решения:

**1. Используйте Railway.app (проще)**

Railway поддерживает все функции включая RCON:
- Зайдите на [railway.app](https://railway.app)
- Нажмите "New Project" → "Deploy from GitHub"
- Выберите репозиторий
- Добавьте переменные окружения
- Deploy!

**2. Отдельный сервер для RCON**

- Vercel для сайта
- VPS/Dedicated для бота + RCON

---

## Проверка работы

1. **Сайт:** `https://ваш-домен.vercel.app`
2. **Бот:** [@DeltaPayment_bot](https://t.me/DeltaPayment_bot) - отправьте `/start`

---

Если нужна помощь - пишите в Telegram!
