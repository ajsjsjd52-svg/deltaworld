# Дополнительные услуги - Инструкция

## Покупка риликов

### Как это работает
- 1₽ = 2 рилика
- Минимум: 2 рилика (1₽)
- Максимум за один раз: 20 000 риликов (10 000₽)
- Ползунок для выбора количества

### API endpoint
**POST /api/grant-relics**

Запрос:
```json
{
  "nickname": "Player123",
  "amount": 100
}
```

### RCON команда
По умолчанию используется: `eco give <nickname> <amount>`

Настройте в `server.js` под ваш плагин экономики:
- **EssentialsX**: `eco give ${nickname} ${amount}`
- **Vault**: `eco give ${nickname} ${amount}`
- Другой плагин: измените команду в коде

## Размут (15₽)

### Описание
Снятие мута с аккаунта игрока

### API endpoint
**POST /api/unmute**

Запрос:
```json
{
  "nickname": "Player123"
}
```

### RCON команда
По умолчанию: `unmute <nickname>`

Настройте под ваш плагин:
- **LiteBans**: `unmute ${nickname}`
- **AdvancedBan**: `unmute ${nickname}`
- **EssentialsX**: `unmute ${nickname}`

## Разбан (150₽)

### Описание
Снятие бана с аккаунта игрока

### API endpoint
**POST /api/unban**

Запрос:
```json
{
  "nickname": "Player123"
}
```

### RCON команда
По умолчанию: `pardon <nickname>`

Настройте под ваш плагин:
- **Vanilla**: `pardon ${nickname}`
- **LiteBans**: `unban ${nickname}`
- **AdvancedBan**: `unban ${nickname}`

## Настройка команд

Откройте `server.js` и найдите соответствующие endpoints:

### Для риликов:
```javascript
const command = `eco give ${nickname} ${amount}`;
```

### Для размута:
```javascript
const command = `unmute ${nickname}`;
```

### Для разбана:
```javascript
const command = `pardon ${nickname}`;
```

Измените команды под ваши плагины!

## Интеграция с платежной системой

В `public/script.js` найдите функции:
- `buyRelics()` - покупка риликов
- `buyUnmute()` - покупка размута
- `buyUnban()` - покупка разбана

После успешной оплаты платежная система должна отправить POST запрос на соответствующий endpoint:

```javascript
// Пример для риликов
fetch('https://ваш-сайт.ru/api/grant-relics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nickname: 'Player123',
        amount: 100
    })
});
```

## Тестирование

Вы можете протестировать через curl:

```bash
# Тест выдачи риликов
curl -X POST http://localhost:3000/api/grant-relics \
  -H "Content-Type: application/json" \
  -d '{"nickname":"TestPlayer","amount":100}'

# Тест размута
curl -X POST http://localhost:3000/api/unmute \
  -H "Content-Type: application/json" \
  -d '{"nickname":"TestPlayer"}'

# Тест разбана
curl -X POST http://localhost:3000/api/unban \
  -H "Content-Type: application/json" \
  -d '{"nickname":"TestPlayer"}'
```

## Безопасность

В продакшене:
1. Добавьте проверку подписи от платежной системы
2. Логируйте все транзакции
3. Добавьте rate limiting
4. Используйте HTTPS

## Популярные плагины

### Экономика
- EssentialsX (рекомендуется)
- Vault
- CMI

### Наказания
- LiteBans (рекомендуется)
- AdvancedBan
- BanManager

Настройте команды под ваши плагины в `server.js`!
