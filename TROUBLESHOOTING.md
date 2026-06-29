# Решение проблем с бесплатной привилегией HERO

## Проблема
```
❌ Ошибка обработки данных: Не все данные заполнены
⚠️ Ошибка выдачи привилегии
```

## Причины и решения

### 1. Railway не обновился автоматически

**Проверка:**
Зайдите в Railway → ваш проект → Deployments → посмотрите дату последнего деплоя

**Решение:**
1. Зайдите в Railway Dashboard
2. Откройте ваш проект
3. Нажмите "Deploy" → "Redeploy" или просто сделайте новый коммит

**Или принудительный редеплой через Git:**
```bash
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### 2. RCON не доступен с Railway

**Проверка RCON:**
Откройте в браузере:
```
https://YOUR-RAILWAY-DOMAIN.railway.app/api/test-rcon
```

Если видите `"success": false` - RCON недоступен.

**Возможные причины:**
- ❌ Minecraft сервер выключен
- ❌ RCON порт (25575) закрыт файрволом
- ❌ RCON пароль неверный
- ❌ IP адрес сервера изменился

**Решение:**

#### A. Проверьте Minecraft сервер работает
```bash
# Подключитесь к серверу и проверьте:
telnet 166.1.144.20 25074
```

#### B. Проверьте RCON порт открыт
```bash
telnet 166.1.144.20 25575
```

#### C. Проверьте `server.properties` на сервере Minecraft
```properties
enable-rcon=true
rcon.port=25575
rcon.password=2557525575
```

#### D. Обновите Environment Variables на Railway
1. Railway Dashboard → ваш проект → Settings → Variables
2. Добавьте или обновите:
```
RCON_HOST=166.1.144.20
RCON_PORT=25575
RCON_PASSWORD=2557525575
TELEGRAM_BOT_TOKEN=8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU
```

### 3. Webhook не настроен или указал неверный URL

**Проверка webhook:**
```
https://api.telegram.org/bot8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU/getWebhookInfo
```

**Правильная настройка webhook:**
```
https://api.telegram.org/bot8701634017:AAHl2jmFjDFJ_6qVB4WZvRuj8UgWG2ccdkU/setWebhook?url=https://YOUR-RAILWAY-DOMAIN.railway.app/api/telegram-webhook
```

⚠️ Замените `YOUR-RAILWAY-DOMAIN` на ваш реальный домен Railway!

## Тестирование после исправления

### 1. Проверьте конфиги загружаются:
```
https://YOUR-RAILWAY-DOMAIN.railway.app/api/health
```

Должен вернуть:
```json
{
  "status": "ok",
  "configs": {
    "rcon": "166.1.144.20:25575",
    "ranks": 9,
    "services": 2
  }
}
```

### 2. Проверьте RCON работает:
```
https://YOUR-RAILWAY-DOMAIN.railway.app/api/test-rcon
```

Должен вернуть:
```json
{
  "success": true,
  "rcon_host": "166.1.144.20",
  "rcon_port": 25575,
  "response": "There are 0 of a max of 20 players online:"
}
```

### 3. Проверьте webhook работает:
Напишите боту `/start` - должен ответить меню

### 4. Проверьте бесплатную привилегию:
1. Откройте сайт
2. Нажмите "Получить HERO"
3. Введите никнейм в боте
4. Должно прийти: "✅ Привилегия HERO успешно выдана!"

## Логи Railway

Чтобы увидеть что происходит:
1. Railway Dashboard → ваш проект
2. Вкладка "Logs"
3. Смотрите ошибки в реальном времени

Ищите строки:
```
=== /start called ===
Chat ID: ...
Start param: pay_rank_hero_NICKNAME_0
Parts: [ 'pay', 'rank', 'hero', 'NICKNAME', '0' ]
Rank: HERO Price: 0 Nickname: NICKNAME
Free rank detected, granting immediately...
Executing RCON command: lp user NICKNAME parent set hero
RCON config: { host: '166.1.144.20', port: 25575 }
```

Если видите:
```
❌ RCON error: Error: connect ETIMEDOUT
```
Значит RCON порт недоступен с Railway.

## Альтернатива: Запуск локально

Если Railway не работает, можете запустить локально:

```bash
cd C:\Users\a2807\Desktop\simpleunlocker_release
node server.js
```

Бот будет работать в режиме polling (без webhook).

## Контакты для помощи

Если ничего не помогло:
- Проверьте что Minecraft сервер вообще работает
- Проверьте что RCON включен на сервере
- Попробуйте перезапустить Minecraft сервер
