require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Rcon = require('rcon');

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Конфигурация цен для рангов (в рублях и звездах 1:1)
const RANKS = {
    'hero': { name: 'HERO', price: 9, stars: 9, command: 'lp user {nickname} parent set hero' },
    'titan': { name: 'TITAN', price: 17, stars: 17, command: 'lp user {nickname} parent set titan' },
    'avenger': { name: 'AVENGER', price: 25, stars: 25, command: 'lp user {nickname} parent set avenger' },
    'overlord': { name: 'OVERLORD', price: 50, stars: 50, command: 'lp user {nickname} parent set overlord' },
    'minister': { name: 'MINISTER', price: 115, stars: 115, command: 'lp user {nickname} parent set minister' },
    'imperator': { name: 'IMPERATOR', price: 199, stars: 199, command: 'lp user {nickname} parent set imperator' },
    'daemon': { name: 'DAEMON', price: 359, stars: 359, command: 'lp user {nickname} parent set daemon' },
    'cobra': { name: 'COBRA', price: 599, stars: 599, command: 'lp user {nickname} parent set cobra' },
    'god': { name: 'GOD', price: 999, stars: 999, command: 'lp user {nickname} parent set god' }
};

// Конфигурация услуг
const SERVICES = {
    'unmute': { name: 'Размут', price: 15, stars: 15, command: 'unmute {nickname}' },
    'unban': { name: 'Разбан', price: 150, stars: 150, command: 'unban {nickname}' }
};

// Хранилище данных пользователей (в production использовать БД)
const userSessions = {};

// Подключение к RCON
function executeRconCommand(command) {
    return new Promise((resolve, reject) => {
        const rcon = new Rcon(
            process.env.RCON_HOST,
            process.env.RCON_PORT,
            process.env.RCON_PASSWORD
        );

        rcon.on('auth', () => {
            rcon.send(command);
        });

        rcon.on('response', (response) => {
            rcon.disconnect();
            resolve(response);
        });

        rcon.on('error', (err) => {
            reject(err);
        });

        rcon.connect();
    });
}

// Команда /start
bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const startParam = match[1].trim();
    
    // Если есть параметр (пришел с сайта)
    if (startParam) {
        try {
            // Формат: /start pay_type_item_nickname_amount
            // Примеры: 
            // /start pay_rank_hero_Steve_9
            // /start pay_service_unmute_Alex_15
            // /start pay_relics_Steve_100_20
            
            const parts = startParam.split('_');
            
            if (parts[0] === 'pay' && parts.length >= 4) {
                const type = parts[1]; // rank, service, relics
                const item = parts[2]; // hero, unmute, или nickname для relics
                const nickname = parts[3];
                const priceOrAmount = parts[4];
                
                let title, description, price;
                
                if (type === 'rank') {
                    const rank = RANKS[item];
                    if (!rank) {
                        throw new Error('Неизвестный ранг');
                    }
                    title = `Привилегия ${rank.name}`;
                    description = `Привилегия ${rank.name} для игрока ${nickname}`;
                    price = rank.stars;
                    
                    // Сохраняем данные для успешного платежа
                    userSessions[chatId] = {
                        type: 'rank',
                        item: item,
                        nickname: nickname,
                        price: price
                    };
                    
                } else if (type === 'service') {
                    const service = SERVICES[item];
                    if (!service) {
                        throw new Error('Неизвестная услуга');
                    }
                    title = service.name;
                    description = `${service.name} для игрока ${nickname}`;
                    price = service.stars;
                    
                    userSessions[chatId] = {
                        type: 'service',
                        item: item,
                        nickname: nickname,
                        price: price
                    };
                    
                } else if (type === 'relics') {
                    const amount = parseInt(priceOrAmount);
                    price = Math.ceil(amount / 5);
                    title = `${amount.toLocaleString()} реликов`;
                    description = `${amount.toLocaleString()} реликов для игрока ${nickname}`;
                    
                    userSessions[chatId] = {
                        type: 'relics',
                        amount: amount,
                        nickname: nickname,
                        price: price
                    };
                }
                
                // Отправляем приветственное сообщение с информацией о покупке
                const purchaseMessage = `
🎮 <b>DeltaPayment - Deltaworld</b>

📦 <b>Покупка:</b> ${title}
👤 <b>Никнейм:</b> ${nickname}
💰 <b>Сумма:</b> ${price}⭐ (${price}₽)

Нажмите кнопку ниже для оплаты через Telegram Stars
                `.trim();
                
                await bot.sendMessage(chatId, purchaseMessage, { parse_mode: 'HTML' });
                
                // Отправляем инвойс для оплаты
                await bot.sendInvoice(chatId, {
                    title: title,
                    description: description,
                    payload: JSON.stringify({
                        chatId: chatId,
                        type: userSessions[chatId].type,
                        item: userSessions[chatId].item || item,
                        amount: userSessions[chatId].amount,
                        nickname: nickname
                    }),
                    provider_token: '', // Для Stars токен не нужен
                    currency: 'XTR', // Telegram Stars
                    prices: [{ label: title, amount: price }]
                });
                
                return;
            }
        } catch (error) {
            console.error('Error parsing start parameter:', error);
            bot.sendMessage(chatId, '❌ Ошибка обработки данных. Попробуйте выбрать товар заново на сайте.');
            return;
        }
    }
    
    // Обычный /start без параметров - показываем меню
    const welcomeMessage = `
🎮 <b>Добро пожаловать в DeltaPayment!</b>

Здесь вы можете приобрести привилегии и услуги для сервера <b>Deltaworld</b> используя <b>Telegram Stars</b> ⭐

<b>Доступные категории:</b>
🏆 Донат привилегии (от 9⭐)
🛠 Услуги (размут, разбан)
💎 Релики (от 1⭐)

Выберите действие ниже:
    `.trim();

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏆 Донат привилегии', callback_data: 'category_ranks' }],
                [{ text: '🛠 Услуги', callback_data: 'category_services' }],
                [{ text: '💎 Купить релики', callback_data: 'category_relics' }],
                [{ text: 'ℹ️ Информация', callback_data: 'info' }]
            ]
        },
        parse_mode: 'HTML'
    };

    bot.sendMessage(chatId, welcomeMessage, keyboard);
});

// Обработка callback запросов
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    try {
        // Категория: Донат привилегии
        if (data === 'category_ranks') {
            const message = `
🏆 <b>Донат привилегии</b>

Выберите привилегию для покупки:

<b>HERO</b> - 9⭐ (9₽)
<b>TITAN</b> - 17⭐ (17₽)
<b>AVENGER</b> - 25⭐ (25₽)
<b>OVERLORD</b> - 50⭐ (50₽)
<b>MINISTER</b> - 115⭐ (115₽)
<b>IMPERATOR</b> - 199⭐ (199₽)
<b>DAEMON</b> - 359⭐ (359₽)
<b>COBRA</b> - 599⭐ (599₽)
<b>GOD</b> - 999⭐ (999₽)
            `.trim();

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'HERO (9⭐)', callback_data: 'rank_hero' },
                            { text: 'TITAN (17⭐)', callback_data: 'rank_titan' }
                        ],
                        [
                            { text: 'AVENGER (25⭐)', callback_data: 'rank_avenger' },
                            { text: 'OVERLORD (50⭐)', callback_data: 'rank_overlord' }
                        ],
                        [
                            { text: 'MINISTER (115⭐)', callback_data: 'rank_minister' },
                            { text: 'IMPERATOR (199⭐)', callback_data: 'rank_imperator' }
                        ],
                        [
                            { text: 'DAEMON (359⭐)', callback_data: 'rank_daemon' },
                            { text: 'COBRA (599⭐)', callback_data: 'rank_cobra' }
                        ],
                        [{ text: 'GOD (999⭐)', callback_data: 'rank_god' }],
                        [{ text: '← Назад', callback_data: 'back_to_menu' }]
                    ]
                },
                parse_mode: 'HTML'
            };

            bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                ...keyboard
            });
        }

        // Категория: Услуги
        else if (data === 'category_services') {
            const message = `
🛠 <b>Услуги</b>

Доступные услуги:

<b>Размут</b> - 15⭐ (15₽)
Снятие мута с вашего аккаунта

<b>Разбан</b> - 150⭐ (150₽)
Снятие бана с вашего аккаунта
            `.trim();

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Размут (15⭐)', callback_data: 'service_unmute' }],
                        [{ text: 'Разбан (150⭐)', callback_data: 'service_unban' }],
                        [{ text: '← Назад', callback_data: 'back_to_menu' }]
                    ]
                },
                parse_mode: 'HTML'
            };

            bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                ...keyboard
            });
        }

        // Категория: Релики
        else if (data === 'category_relics') {
            const message = `
💎 <b>Покупка Реликов</b>

Курс: <b>1 звезда = 5 реликов</b>

Выберите количество:
            `.trim();

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '50 реликов (10⭐)', callback_data: 'relics_50' },
                            { text: '100 реликов (20⭐)', callback_data: 'relics_100' }
                        ],
                        [
                            { text: '500 реликов (100⭐)', callback_data: 'relics_500' },
                            { text: '1000 реликов (200⭐)', callback_data: 'relics_1000' }
                        ],
                        [
                            { text: '5000 реликов (1000⭐)', callback_data: 'relics_5000' },
                            { text: '10000 реликов (2000⭐)', callback_data: 'relics_10000' }
                        ],
                        [{ text: '← Назад', callback_data: 'back_to_menu' }]
                    ]
                },
                parse_mode: 'HTML'
            };

            bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                ...keyboard
            });
        }

        // Информация
        else if (data === 'info') {
            const message = `
ℹ️ <b>Информация о DeltaPayment</b>

<b>Что такое Telegram Stars?</b> ⭐
Telegram Stars - это внутренняя валюта Telegram для оплаты товаров и услуг.

<b>Курс:</b>
• 1⭐ = 1₽ для донатов и услуг
• 1⭐ = 5 реликов

<b>Как купить Stars?</b>
1. Откройте любой канал с платным контентом
2. Купите Stars через Telegram
3. Вернитесь в бот и оплатите покупку

<b>Сервер:</b> Deltaworld
<b>IP:</b> play.deltaworld.ru

По вопросам: @deltaworld_admin
            `.trim();

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '← Назад', callback_data: 'back_to_menu' }]
                    ]
                },
                parse_mode: 'HTML'
            };

            bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                ...keyboard
            });
        }

        // Назад в главное меню
        else if (data === 'back_to_menu') {
            const message = `
🎮 <b>DeltaPayment - Deltaworld</b>

Выберите категорию для покупки:
            `.trim();

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏆 Донат привилегии', callback_data: 'category_ranks' }],
                        [{ text: '🛠 Услуги', callback_data: 'category_services' }],
                        [{ text: '💎 Купить релики', callback_data: 'category_relics' }],
                        [{ text: 'ℹ️ Информация', callback_data: 'info' }]
                    ]
                },
                parse_mode: 'HTML'
            };

            bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                ...keyboard
            });
        }

        // Выбор конкретного ранга
        else if (data.startsWith('rank_')) {
            const rankKey = data.replace('rank_', '');
            const rank = RANKS[rankKey];

            userSessions[chatId] = {
                type: 'rank',
                item: rankKey,
                price: rank.stars,
                step: 'awaiting_nickname'
            };

            bot.sendMessage(chatId, `
🏆 <b>${rank.name}</b> - ${rank.stars}⭐

Введите ваш игровой никнейм в Minecraft:
            `.trim(), { parse_mode: 'HTML' });
        }

        // Выбор услуги
        else if (data.startsWith('service_')) {
            const serviceKey = data.replace('service_', '');
            const service = SERVICES[serviceKey];

            userSessions[chatId] = {
                type: 'service',
                item: serviceKey,
                price: service.stars,
                step: 'awaiting_nickname'
            };

            bot.sendMessage(chatId, `
🛠 <b>${service.name}</b> - ${service.stars}⭐

Введите ваш игровой никнейм в Minecraft:
            `.trim(), { parse_mode: 'HTML' });
        }

        // Выбор реликов
        else if (data.startsWith('relics_')) {
            const amount = parseInt(data.replace('relics_', ''));
            const stars = Math.ceil(amount / 5);

            userSessions[chatId] = {
                type: 'relics',
                amount: amount,
                price: stars,
                step: 'awaiting_nickname'
            };

            bot.sendMessage(chatId, `
💎 <b>${amount.toLocaleString()} реликов</b> - ${stars}⭐

Введите ваш игровой никнейм в Minecraft:
            `.trim(), { parse_mode: 'HTML' });
        }

        bot.answerCallbackQuery(query.id);

    } catch (error) {
        console.error('Error handling callback:', error);
        bot.answerCallbackQuery(query.id, { text: 'Произошла ошибка' });
    }
});

// Обработка текстовых сообщений (ввод никнейма)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Игнорируем команды
    if (text && text.startsWith('/')) return;

    const session = userSessions[chatId];

    if (session && session.step === 'awaiting_nickname') {
        const nickname = text.trim();

        if (nickname.length < 3 || nickname.length > 16) {
            bot.sendMessage(chatId, '❌ Никнейм должен быть от 3 до 16 символов. Попробуйте еще раз:');
            return;
        }

        // Сохраняем никнейм
        session.nickname = nickname;
        session.step = 'ready_to_pay';

        // Создаем инвойс для оплаты
        let title, description;

        if (session.type === 'rank') {
            const rank = RANKS[session.item];
            title = `Привилегия ${rank.name}`;
            description = `Привилегия ${rank.name} для игрока ${nickname}`;
        } else if (session.type === 'service') {
            const service = SERVICES[session.item];
            title = service.name;
            description = `${service.name} для игрока ${nickname}`;
        } else if (session.type === 'relics') {
            title = `${session.amount} реликов`;
            description = `${session.amount} реликов для игрока ${nickname}`;
        }

        // Отправляем инвойс
        try {
            await bot.sendInvoice(chatId, {
                title: title,
                description: description,
                payload: JSON.stringify({
                    chatId: chatId,
                    type: session.type,
                    item: session.item,
                    amount: session.amount,
                    nickname: nickname
                }),
                provider_token: '', // Для Stars токен не нужен
                currency: 'XTR', // Telegram Stars
                prices: [{ label: title, amount: session.price }]
            });
        } catch (error) {
            console.error('Error sending invoice:', error);
            bot.sendMessage(chatId, '❌ Произошла ошибка при создании счета. Попробуйте позже.');
        }
    }
});

// Обработка pre-checkout запросов
bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true);
});

// Обработка успешного платежа
bot.on('successful_payment', async (msg) => {
    const chatId = msg.chat.id;
    const payment = msg.successful_payment;
    const payload = JSON.parse(payment.invoice_payload);

    try {
        let command;

        if (payload.type === 'rank') {
            const rank = RANKS[payload.item];
            command = rank.command.replace('{nickname}', payload.nickname);
        } else if (payload.type === 'service') {
            const service = SERVICES[payload.item];
            command = service.command.replace('{nickname}', payload.nickname);
        } else if (payload.type === 'relics') {
            // Команда для выдачи реликов (замените на свою)
            command = `give ${payload.nickname} relics ${payload.amount}`;
        }

        // Выполняем команду через RCON
        try {
            const response = await executeRconCommand(command);
            console.log('RCON response:', response);

            bot.sendMessage(chatId, `
✅ <b>Оплата успешна!</b>

Покупка была автоматически выдана игроку <b>${payload.nickname}</b>

Спасибо за покупку! Приятной игры на Deltaworld! 🎮
            `.trim(), { parse_mode: 'HTML' });

        } catch (rconError) {
            console.error('RCON error:', rconError);
            bot.sendMessage(chatId, `
⚠️ <b>Оплата получена</b>

Ваша покупка будет выдана в течение нескольких минут.
Если покупка не поступила, обратитесь к администратору.

Игрок: <b>${payload.nickname}</b>
            `.trim(), { parse_mode: 'HTML' });
        }

        // Очищаем сессию
        delete userSessions[chatId];

    } catch (error) {
        console.error('Error processing payment:', error);
        bot.sendMessage(chatId, '❌ Произошла ошибка при обработке платежа. Обратитесь к администратору.');
    }
});

console.log('✅ Telegram бот DeltaPayment запущен!');
