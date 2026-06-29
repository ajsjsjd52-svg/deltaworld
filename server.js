const express = require('express');
const Rcon = require('rcon');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Загрузка конфигураций из JSON файлов
const rconConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'rcon.json'), 'utf8'));
const serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'server.json'), 'utf8'));
const ranksConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'ranks.json'), 'utf8'));
const servicesConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'services.json'), 'utf8'));
const telegramConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'telegram.json'), 'utf8'));

console.log('📁 Конфигурации загружены из файлов:');
console.log('  ✓ config/rcon.json');
console.log('  ✓ config/server.json');
console.log('  ✓ config/ranks.json -', Object.keys(ranksConfig.ranks).length, 'привилегий');
console.log('  ✓ config/services.json -', Object.keys(servicesConfig.services).length, 'услуг');
console.log('  ✓ config/telegram.json');

const app = express();
const PORT = process.env.PORT || serverConfig.api.port || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// RCON Configuration (из файла или .env)
const rconConfigFinal = {
  host: process.env.RCON_HOST || rconConfig.host,
  port: parseInt(process.env.RCON_PORT) || rconConfig.port,
  password: process.env.RCON_PASSWORD || rconConfig.password
};

// API endpoint для получения информации о сервере
app.get('/api/server-status', async (req, res) => {
  const rcon = new Rcon(rconConfigFinal.host, rconConfigFinal.port, rconConfigFinal.password);
  
  try {
    await new Promise((resolve, reject) => {
      rcon.on('auth', () => resolve());
      rcon.on('error', (err) => reject(err));
      rcon.connect();
    });

    // Получаем список игроков
    const listResponse = await new Promise((resolve, reject) => {
      rcon.send('list', (response) => {
        resolve(response);
      });
    });

    // Получаем TPS (если доступно)
    const tpsResponse = await new Promise((resolve, reject) => {
      rcon.send('tps', (response) => {
        resolve(response);
      });
    });

    rcon.disconnect();

    res.json({
      online: true,
      players: listResponse,
      tps: tpsResponse,
      ip: serverConfig.minecraft.ip,
      port: serverConfig.minecraft.port
    });
  } catch (error) {
    console.error('RCON Error:', error);
    res.json({
      online: false,
      error: 'Не удалось подключиться к серверу'
    });
  }
});

// API endpoint для выполнения команд (требует авторизации в реальном проекте!)
app.post('/api/rcon-command', async (req, res) => {
  const { command, password } = req.body;
  
  // Простая защита - в реальном проекте используйте JWT или сессии
  if (password !== rconConfigFinal.password) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  const rcon = new Rcon(rconConfigFinal.host, rconConfigFinal.port, rconConfigFinal.password);
  
  try {
    await new Promise((resolve, reject) => {
      rcon.on('auth', () => resolve());
      rcon.on('error', (err) => reject(err));
      rcon.connect();
    });

    const response = await new Promise((resolve, reject) => {
      rcon.send(command, (response) => {
        resolve(response);
      });
    });

    rcon.disconnect();

    res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('RCON Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка выполнения команды'
    });
  }
});

// API endpoint для выдачи риликов
app.post('/api/grant-relics', async (req, res) => {
  const { nickname, amount } = req.body;
  
  if (!nickname || !amount) {
    return res.status(400).json({ error: 'Необходимо указать nickname и amount' });
  }

  const rcon = new Rcon(rconConfigFinal.host, rconConfigFinal.port, rconConfigFinal.password);
  
  try {
    await new Promise((resolve, reject) => {
      rcon.on('auth', () => resolve());
      rcon.on('error', (err) => reject(err));
      rcon.connect();
    });

    // Команда для выдачи риликов из конфига
    const command = servicesConfig.relics.command
      .replace('{nickname}', nickname)
      .replace('{amount}', amount);
    
    const response = await new Promise((resolve, reject) => {
      rcon.send(command, (response) => {
        resolve(response);
      });
    });

    rcon.disconnect();

    console.log(`${amount} риликов выдано игроку ${nickname}`);
    
    res.json({
      success: true,
      message: `${amount} риликов успешно выдано игроку ${nickname}`,
      response: response
    });
  } catch (error) {
    console.error('RCON Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка выдачи риликов'
    });
  }
});

// API endpoint для размута
app.post('/api/unmute', async (req, res) => {
  const { nickname } = req.body;
  
  if (!nickname) {
    return res.status(400).json({ error: 'Необходимо указать nickname' });
  }

  const rcon = new Rcon(rconConfigFinal.host, rconConfigFinal.port, rconConfigFinal.password);
  
  try {
    await new Promise((resolve, reject) => {
      rcon.on('auth', () => resolve());
      rcon.on('error', (err) => reject(err));
      rcon.connect();
    });

    // Команда размута из конфига
    const command = servicesConfig.services.unmute.command.replace('{nickname}', nickname);
    
    const response = await new Promise((resolve, reject) => {
      rcon.send(command, (response) => {
        resolve(response);
      });
    });

    rcon.disconnect();

    console.log(`Размут выдан игроку ${nickname}`);
    
    res.json({
      success: true,
      message: `Размут успешно выдан игроку ${nickname}`,
      response: response
    });
  } catch (error) {
    console.error('RCON Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка выдачи размута'
    });
  }
});

// API endpoint для разбана
app.post('/api/unban', async (req, res) => {
  const { nickname } = req.body;
  
  if (!nickname) {
    return res.status(400).json({ error: 'Необходимо указать nickname' });
  }

  const rcon = new Rcon(rconConfigFinal.host, rconConfigFinal.port, rconConfigFinal.password);
  
  try {
    await new Promise((resolve, reject) => {
      rcon.on('auth', () => resolve());
      rcon.on('error', (err) => reject(err));
      rcon.connect();
    });

    // Команда разбана из конфига
    const command = servicesConfig.services.unban.command.replace('{nickname}', nickname);
    
    const response = await new Promise((resolve, reject) => {
      rcon.send(command, (response) => {
        resolve(response);
      });
    });

    rcon.disconnect();

    console.log(`Разбан выдан игроку ${nickname}`);
    
    res.json({
      success: true,
      message: `Разбан успешно выдан игроку ${nickname}`,
      response: response
    });
  } catch (error) {
    console.error('RCON Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка выдачи разбана'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

// ============================================
// TELEGRAM BOT
// ============================================

// Инициализация бота (токен из конфига или .env)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || telegramConfig.bot.token, { polling: true });

// Конфигурация цен для рангов (из файла ranks.json)
const RANKS = ranksConfig.ranks;

// Конфигурация услуг (из файла services.json)
const SERVICES = servicesConfig.services;

// Хранилище данных пользователей (в production использовать БД)
const userSessions = {};

// Подключение к RCON
function executeRconCommand(command) {
    return new Promise((resolve, reject) => {
        const rcon = new Rcon(
            rconConfigFinal.host,
            rconConfigFinal.port,
            rconConfigFinal.password
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
            // Для rank: pay_rank_hero_fastword_999
            // Для service: pay_service_unmute_fastword_15
            // Для relics: pay_relics_fastword_100_20 (nickname, amount, price)
            const parts = startParam.split('_');
            
            console.log('Start params:', parts); // Debug
            
            if (parts[0] === 'pay' && parts.length >= 4) {
                const type = parts[1]; // rank, service, relics
                let item, nickname, priceOrAmount;
                
                let title, description, price;
                
                if (type === 'rank') {
                    // pay_rank_hero_fastword_999
                    item = parts[2]; // hero
                    nickname = parts[3]; // fastword
                    // parts[4] is price but we get it from RANKS
                    
                    const rank = RANKS[item];
                    if (!rank) {
                        throw new Error('Неизвестный ранг: ' + item);
                    }
                    
                    price = rank.stars;
                    
                    // Если привилегия бесплатная - выдаем сразу
                    if (price === 0) {
                        try {
                            const command = rank.command.replace('{nickname}', nickname);
                            await executeRconCommand(command);
                            
                            await bot.sendMessage(chatId, `
✅ <b>Привилегия ${rank.name} успешно выдана!</b>

Игрок: <b>${nickname}</b>

Привилегия активирована бесплатно! 🎁
Приятной игры на Deltaworld! 🎮
                            `.trim(), { parse_mode: 'HTML' });
                            return; // Завершаем обработку
                        } catch (error) {
                            console.error('RCON error:', error);
                            console.log('📋 FREE HERO REQUEST:', nickname);
                            
                            await bot.sendMessage(chatId, `
✅ <b>Заявка на привилегию ${rank.name} принята!</b>

Игрок: <b>${nickname}</b>

🎁 Бесплатная привилегия будет выдана автоматически при следующем подключении к серверу.

⚠️ <b>Если привилегия не появилась через 5 минут:</b>
Зайдите на сервер и напишите: <code>/request hero ${nickname}</code>

Приятной игры на Deltaworld! 🎮
                            `.trim(), { parse_mode: 'HTML' });
                            return;
                        }
                    }
                    
                    // Для платных привилегий
                    title = `Привилегия ${rank.name}`;
                    description = `Привилегия ${rank.name} для игрока ${nickname}`;
                    
                    userSessions[chatId] = {
                        type: 'rank',
                        item: item,
                        nickname: nickname,
                        price: price
                    };
                    
                } else if (type === 'service') {
                    // pay_service_unmute_fastword_15
                    item = parts[2]; // unmute or unban
                    nickname = parts[3]; // fastword
                    
                    const service = SERVICES[item];
                    if (!service) {
                        throw new Error('Неизвестная услуга: ' + item);
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
                    // pay_relics_fastword_100_20
                    nickname = parts[2]; // fastword
                    const amount = parseInt(parts[3]); // 100
                    // parts[4] is price (20) but we calculate it
                    
                    if (isNaN(amount)) {
                        throw new Error('Неверное количество реликов');
                    }
                    price = Math.ceil(amount / servicesConfig.relics.rate);
                    title = `${amount.toLocaleString()} реликов`;
                    description = `${amount.toLocaleString()} реликов для игрока ${nickname}`;
                    
                    userSessions[chatId] = {
                        type: 'relics',
                        amount: amount,
                        nickname: nickname,
                        price: price
                    };
                } else {
                    throw new Error('Неизвестный тип покупки: ' + type);
                }
                
                // Проверяем что все данные заполнены
                if (!title || !description || !price) {
                    throw new Error('Не все данные заполнены');
                }
                
                console.log('Creating invoice:', { title, description, price }); // Debug
                
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
                // Правильный формат для node-telegram-bot-api
                await bot.sendInvoice(
                    chatId,
                    title,
                    description,
                    JSON.stringify({
                        chatId: chatId,
                        type: userSessions[chatId].type,
                        item: userSessions[chatId].item,
                        amount: userSessions[chatId].amount,
                        nickname: nickname
                    }),
                    '', // provider_token - пустая строка для Stars
                    'XTR', // currency
                    [{ label: title, amount: price }] // prices
                );
                
                console.log('Invoice sent successfully!'); // Debug
                return;
            } else {
                throw new Error('Неверный формат параметров');
            }
        } catch (error) {
            console.error('Error in /start handler:', error);
            bot.sendMessage(chatId, `❌ Ошибка обработки данных: ${error.message}\n\nПопробуйте выбрать товар заново на сайте.`);
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

<b>HERO</b> - 🎁 БЕСПЛАТНО!
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
                            { text: '🎁 HERO (БЕСПЛАТНО)', callback_data: 'rank_hero' },
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

            // Если привилегия бесплатная (0 звезд) - выдаем сразу
            if (rank.stars === 0) {
                userSessions[chatId] = {
                    type: 'rank',
                    item: rankKey,
                    price: 0,
                    step: 'awaiting_nickname_free'
                };

                bot.sendMessage(chatId, `
🎁 <b>${rank.name}</b> - БЕСПЛАТНО!

Введите ваш игровой никнейм в Minecraft:
                `.trim(), { parse_mode: 'HTML' });
            } else {
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

    if (session && (session.step === 'awaiting_nickname' || session.step === 'awaiting_nickname_free')) {
        const nickname = text.trim();

        if (nickname.length < 3 || nickname.length > 16) {
            bot.sendMessage(chatId, '❌ Никнейм должен быть от 3 до 16 символов. Попробуйте еще раз:');
            return;
        }

        // Сохраняем никнейм
        session.nickname = nickname;

        // Если это бесплатная привилегия - выдаем сразу без оплаты
        if (session.step === 'awaiting_nickname_free' && session.price === 0) {
            try {
                const rank = RANKS[session.item];
                const command = rank.command.replace('{nickname}', nickname);
                
                await executeRconCommand(command);
                
                bot.sendMessage(chatId, `
✅ <b>Привилегия ${rank.name} успешно выдана!</b>

Игрок: <b>${nickname}</b>

Привилегия активирована бесплатно! 🎁
Приятной игры на Deltaworld! 🎮
                `.trim(), { parse_mode: 'HTML' });

                // Очищаем сессию
                delete userSessions[chatId];
                
            } catch (error) {
                console.error('RCON error:', error);
                bot.sendMessage(chatId, `
⚠️ <b>Ошибка выдачи привилегии</b>

Попробуйте позже или обратитесь к администратору.
                `.trim(), { parse_mode: 'HTML' });
            }
            return;
        }

        // Для платных привилегий - создаем инвойс
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
            await bot.sendInvoice(
                chatId,
                title,
                description,
                JSON.stringify({
                    chatId: chatId,
                    type: session.type,
                    item: session.item,
                    amount: session.amount,
                    nickname: nickname
                }),
                '', // provider_token - пустая строка для Stars
                'XTR', // currency
                [{ label: title, amount: session.price }] // prices
            );
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
            // Команда для выдачи реликов из конфига
            command = servicesConfig.relics.command
              .replace('{nickname}', payload.nickname)
              .replace('{amount}', payload.amount);
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
