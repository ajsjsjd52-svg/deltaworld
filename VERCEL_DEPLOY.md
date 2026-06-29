# 🚀 Деплой на Vercel

## Подготовка

### 1. Установите Vercel CLI (опционально)

```bash
npm install -g vercel
```

### 2. Создайте аккаунт на Vercel

Зайдите на [vercel.com](https://vercel.com) и зарегистрируйтесь через GitHub.

---

## Деплой через веб-интерфейс (рекомендуется)

### Шаг 1: Загрузите проект на GitHub

1. Создайте новый репозиторий на GitHub
2. Загрузите все файлы проекта

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ваш-юзернейм/deltaworld.git
git push -u origin main
```

### Шаг 2: Импортируйте в Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New"** → **"Project"**
3. Выберите ваш репозиторий `deltaworld`
4. Нажмите **"Import"**

### Шаг 3: Настройте переменные окружения

В настройках проекта добавьте:

| Ключ | Значение |
|------|----------|
| `TELEGRAM_BOT_TOKEN` | `8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU` |
| `RCON_HOST` | IP вашего Minecraft сервера |
| `RCON_PORT` | `25575` |
| `RCON_PASSWORD` | Ваш RCON пароль |
| `MC_SERVER_IP` | `play.deltaworld.ru` |
| `MC_SERVER_PORT` | `25565` |

### Шаг 4: Деплой

Нажмите **"Deploy"** и ждите!

---

## Деплой через CLI

```bash
# Войдите в Vercel
vercel login

# Деплой проекта
vercel

# Добавьте переменные окружения
vercel env add TELEGRAM_BOT_TOKEN
vercel env add RCON_HOST
vercel env add RCON_PORT
vercel env add RCON_PASSWORD
vercel env add MC_SERVER_IP
vercel env add MC_SERVER_PORT

# Production деплой
vercel --prod
```

---

## Настройка Telegram Webhook

После деплоя вам нужно настроить webhook для бота:

### Автоматически (через curl):

```bash
curl -X POST "https://api.telegram.org/bot8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ваш-домен.vercel.app/api/telegram-webhook"}'
```

Замените `ваш-домен.vercel.app` на ваш реальный домен Vercel.

### Через браузер:

Откройте в браузере:

```
https://api.telegram.org/bot8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU/setWebhook?url=https://ваш-домен.vercel.app/api/telegram-webhook
```

Должен вернуться ответ:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

---

## Проверка работы

### 1. Проверьте сайт

Откройте `https://ваш-домен.vercel.app` в браузере.

### 2. Проверьте webhook бота

```bash
curl "https://api.telegram.org/bot8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU/getWebhookInfo"
```

Должно показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://ваш-домен.vercel.app/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 3. Проверьте бота

Откройте [@DeltaPayment_bot](https://t.me/DeltaPayment_bot) и отправьте `/start`

---

## ⚠️ Важные ограничения Vercel

### RCON Connection

**Проблема:** Vercel не поддерживает постоянные TCP соединения.

**Решение:** 
1. Используйте отдельный сервер для RCON (VPS/dedicated)
2. Создайте API прослойку между Vercel и Minecraft сервером
3. Или используйте Vercel только для фронтенда, а бэкенд на другом хостинге

### Рекомендуемая архитектура:

```
Пользователь → Vercel (сайт) → Telegram Bot API
                                     ↓
                                 Webhook
                                     ↓
                            VPS/Dedicated Server
                                     ↓
                               RCON → Minecraft
```

---

## Альтернативные варианты хостинга

Если нужен полный функционал с RCON:

### 1. Railway.app (рекомендуется)

- ✅ Поддержка Node.js
- ✅ TCP соединения
- ✅ Бесплатный tier
- ✅ Простой деплой

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 2. Render.com

- ✅ Бесплатный tier
- ✅ Поддержка Node.js
- ✅ TCP соединения

### 3. Heroku

- ✅ Проверенный вариант
- ❌ Платный (от $7/месяц)

### 4. VPS (DigitalOcean, Hetzner, etc.)

- ✅ Полный контроль
- ✅ Все функции
- ❌ Требует настройки
- ❌ От $5/месяц

---

## Структура для Vercel

```
deltaworld/
├── api/
│   └── index.js          ← API endpoints + Telegram webhook
├── public/
│   ├── index.html        ← Главная страница
│   ├── payment.html      ← Страница оплаты
│   ├── *.css, *.js
│   └── logo.png
├── vercel.json           ← Конфигурация Vercel
├── .vercelignore         ← Что не загружать
└── package.json
```

---

## Обновление проекта

### Через Git (автоматически):

```bash
git add .
git commit -m "Update"
git push
```

Vercel автоматически пересоберёт проект.

### Через CLI:

```bash
vercel --prod
```

---

## Troubleshooting

### Бот не отвечает

1. Проверьте webhook: 
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. Проверьте логи в Vercel Dashboard

3. Убедитесь что токен правильный в Environment Variables

### RCON не работает

- Vercel не поддерживает TCP соединения
- Используйте отдельный сервер для RCON
- Или смените хостинг на Railway/Render

### 404 ошибки

- Проверьте `vercel.json` роутинг
- Убедитесь что файлы в папке `public/`

---

## Контакты

- **Бот:** [@DeltaPayment_bot](https://t.me/DeltaPayment_bot)
- **Сервер:** play.deltaworld.ru

---

✅ **Готово!** Ваш сайт теперь доступен на Vercel!
