# Настройка платежной системы для доната

## Варианты интеграции платежей

### 1. Telegram Bot (Рекомендуется для начала)

Самый простой вариант - создайте Telegram бота для приёма платежей:

**В файле `public/script.js` измените функцию:**
```javascript
function openDonate(rank) {
    window.open('https://t.me/your_bot?start=donate_' + rank, '_blank');
}
```

### 2. Donate Pay / Easy Pay

Популярные сервисы для приёма платежей в СНГ:

```javascript
function openDonate(rank) {
    window.open('https://donate.stream/your_channel?message=' + rank, '_blank');
}
```

### 3. Юkassa / Robokassa

Для официальных платежей:

**Установите SDK:**
```bash
npm install yookassa
```

**Создайте endpoint в `server.js`:**
```javascript
const { YooCheckout } = require('yookassa');

const checkout = new YooCheckout({
    shopId: 'ваш_shop_id',
    secretKey: 'ваш_секретный_ключ'
});

app.post('/api/create-payment', async (req, res) => {
    const { rank, price } = req.body;
    
    try {
        const payment = await checkout.createPayment({
            amount: {
                value: price,
                currency: 'RUB'
            },
            confirmation: {
                type: 'redirect',
                return_url: 'https://ваш-сайт.ru/payment-success'
            },
            description: `Привилегия ${rank} на сервере Deltaworld`
        });
        
        res.json({ paymentUrl: payment.confirmation.confirmation_url });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания платежа' });
    }
});
```

**Измените функцию в `public/script.js`:**
```javascript
async function openDonate(rank) {
    const prices = {
        'hero': 9, 'titan': 17, 'avenger': 25,
        'overlord': 50, 'minister': 115, 'imperator': 199,
        'daemon': 359, 'cobra': 599, 'god': 999
    };
    
    const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank, price: prices[rank] })
    });
    
    const data = await response.json();
    window.open(data.paymentUrl, '_blank');
}
```

### 4. Discord интеграция

Перенаправление в Discord для связи с администрацией:

```javascript
function openDonate(rank) {
    window.open('https://discord.gg/ваш_сервер', '_blank');
}
```

## Автоматическая выдача привилегий

После успешной оплаты нужно автоматически выдать привилегию на сервере.

**Добавьте webhook в `server.js`:**
```javascript
app.post('/api/payment-webhook', async (req, res) => {
    const { rank, playerNickname, status } = req.body;
    
    if (status === 'paid') {
        // Выдаём привилегию через RCON
        const rcon = new Rcon(rconConfig.host, rconConfig.port, rconConfig.password);
        
        await new Promise((resolve, reject) => {
            rcon.on('auth', () => resolve());
            rcon.on('error', (err) => reject(err));
            rcon.connect();
        });
        
        // Команда для выдачи привилегии (зависит от вашего плагина прав)
        await new Promise((resolve) => {
            rcon.send(`lp user ${playerNickname} parent set ${rank}`, () => {
                resolve();
            });
        });
        
        rcon.disconnect();
    }
    
    res.json({ success: true });
});
```

## Плагины для привилегий

Установите на сервер один из плагинов:

1. **LuckPerms** (рекомендуется)
   - Команда: `/lp user <ник> parent set <группа>`

2. **PermissionsEx**
   - Команда: `/pex user <ник> group set <группа>`

3. **GroupManager**
   - Команда: `/manuadd <ник> <группа>`

## Форма для ввода никнейма

Добавьте форму перед оплатой в `public/index.html`:

```html
<div id="donateModal" class="modal" style="display:none;">
    <div class="modal-content">
        <h3>Покупка привилегии <span id="modalRank"></span></h3>
        <input type="text" id="playerNick" placeholder="Ваш игровой никнейм">
        <button onclick="processDonate()">Оплатить</button>
        <button onclick="closeModal()">Отмена</button>
    </div>
</div>
```

**JavaScript:**
```javascript
let selectedRank = '';

function openDonate(rank) {
    selectedRank = rank;
    document.getElementById('modalRank').textContent = rank.toUpperCase();
    document.getElementById('donateModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('donateModal').style.display = 'none';
}

async function processDonate() {
    const nickname = document.getElementById('playerNick').value;
    if (!nickname) {
        alert('Введите ваш игровой никнейм');
        return;
    }
    
    // Здесь создаём платёж с никнеймом
    // ...
}
```

## Тестирование

1. Используйте тестовые режимы платежных систем
2. Проверьте выдачу привилегий на тестовом сервере
3. Убедитесь что webhook работает

## Безопасность

- Всегда проверяйте подпись webhook запросов
- Храните API ключи в .env файле
- Используйте HTTPS для продакшена
- Логируйте все транзакции

## Поддержка

При возникновении проблем проверьте:
- Логи платежной системы
- Логи вашего сервера
- Правильность RCON команд
- Установлен ли плагин прав на MC сервере
