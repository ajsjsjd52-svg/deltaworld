const express = require('express');
const cors = require('cors');
const Rcon = require('rcon');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Загрузка конфигов из файлов
const rconConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'rcon.json'), 'utf8'));
const serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'server.json'), 'utf8'));
const ranksConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'ranks.json'), 'utf8'));
const servicesConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'services.json'), 'utf8'));
const telegramConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'telegram.json'), 'utf8'));

console.log('📁 Конфигурации загружены:');
console.log('  ✓ RCON:', rconConfig.host + ':' + rconConfig.port);
console.log('  ✓ Привилегий:', Object.keys(ranksConfig.ranks).length);
console.log('  ✓ Услуг:', Object.keys(servicesConfig.services).length);
console.log('  ✓ Telegram бот:', telegramConfig.bot.username);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : serverConfig.api.cors.origins,
  credentials: true
}));

// Telegram Bot
const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN || telegramConfig.bot.token,
  { polling: telegramConfig.bot.mode === 'polling' }
);

// Хранилище сессий
const userSessions = {};

// Подключение к RCON
function executeRconCommand(command) {
  return new Promise((resolve, reject) => {
    const rcon = new Rcon(
      process.env.RCON_HOST || rconConfig.host,
      parseInt(process.env.RCON_PORT) || rconConfig.port,
      process.env.RCON_PASSWORD || rconConfig.password
    );

    rcon.on('auth', () => {
      rcon.send(command);
    });

    rcon.on('response', (response) => {
      rcon.disconnect();
      resolve(response);
    });

    rcon.on('error', (err) => {
      rcon.disconnect();
      reject(err);
    });

    rcon.connect();
  });
}

// ============================================
// API ENDPOINTS
// ============================================

// Получить список привилегий
app.get('/api/ranks', (req, res) => {
  res.json(ranksConfig.ranks);
});

// Получить список услуг
app.get('/api/services', (req, res) => {
  res.json(servicesConfig);
});

// Статус сервера
app.get('/api/server-status', async (req, res) => {
  try {
    const listResponse = await executeRconCommand('list');
    
    res.json({
      online: true,
      players: listResponse,
      ip: serverConfig.minecraft.ip,
      port: serverConfig.minecraft.port,
      version: serverConfig.minecraft.version
    });
  } catch (error) {
    console.error('RCON Error:', error);
    res.json({
      online: false,
      error: 'Не удалось подключиться к серверу'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configs: {
      ranks: Object.keys(ranksConfig.ranks).length,
      services: Object.keys(servicesConfig.services).length,
      rcon: rconConfig.host + ':' + rconConfig.port
    }
  });
});

// ============================================
// TELEGRAM BOT
// ============================================

// Команда /start
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const startParam = match[1].trim();
  
  console.log('Start command:', { chatId, startParam });
  
  // Если есть параметр (пришел с сайта)
  if (startParam) {
    try {
      const parts = startParam.split('_');
      
      if (parts[0] === 'pay' && parts.length >= 4) {
        const type = parts[1];
        let nickname, price, title, description;
        
        if (type === 'rank') {
          const item = parts[2];
          nickname = parts[3];
          
          const rank = ranksConfig.ranks[item];
          if (!rank) throw new Error('Неизвестный ранг');
          
          title = `Привилегия ${rank.name}`;
          description = `Привилегия ${rank.name} для игрока ${nickname}`;
          price = rank.stars;
          
          userSessions[chatId] = { type: 'rank', item, nickname, price };
          
        } else if (type === 'service') {
          const item = parts[2];
          nickname = parts[3];
          
          const service = servicesConfig.services[item];
          if (!service) throw new Error('Неизвестная услуга');
          
          title = service.name;
          description = `${service.name} для игрока ${nickname}`;
          price = service.stars;
          
          userSessions[chatId] = { type: 'service', item, nickname, price };
          
        } else if (type === 'relics') {
          nickname = parts[2];
          const amount = parseInt(parts[3]);
          
          if (isNaN(amount)) throw new Error('Неверное количество');
          
          price = Math.ceil(amount / servicesConfig.relics.rate);
          title = `${amount.toLocaleString()} реликов`;
          description = `${amount.toLocaleString()} реликов для игрока ${nickname}`;
          
          userSessions[chatId] = { type: 'relics', amount, nickname, price };
        }
        
        const purchaseMessage = `
🎮 <b>DeltaPayment - Deltaworld</b>

📦 <b>Покупка:</b> ${title}
👤 <b>Никнейм:</b> ${nickname}
💰 <b>Сумма:</b> ${price}⭐ (${price}₽)

Нажмите кнопку ниже для оплаты через Telegram Stars
        `.trim();
        
        await bot.sendMessage(chatId, purchaseMessage, { parse_mode: 'HTML' });
        
        await bot.sendInvoice(
          chatId,
          title,
          description,
          JSON.stringify({
            chatId,
            type: userSessions[chatId].type,
            item: userSessions[chatId].item,
            amount: userSessions[chatId].amount,
            nickname
          }),
          '', // provider_token
          'XTR', // currency
          [{ label: title, amount: price }]
        );
        
        return;
      }
    } catch (error) {
      console.error('Error in start handler:', error);
      await bot.sendMessage(chatId, `❌ Ошибка: ${error.message}\n\nПопробуйте выбрать товар заново на сайте.`);
      return;
    }
  }
  
  // Обычный /start
  await bot.sendMessage(chatId, telegramConfig.messages.welcome, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏆 Донат привилегии', callback_data: 'category_ranks' }],
        [{ text: '🛠 Услуги', callback_data: 'category_services' }],
        [{ text: '💎 Купить релики', callback_data: 'category_relics' }],
        [{ text: 'ℹ️ Информация', callback_data: 'info' }]
      ]
    }
  });
});

// Обработка pre-checkout
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

// Обработка успешного платежа
bot.on('successful_payment', async (msg) => {
  const chatId = msg.chat.id;
  const payment = msg.successful_payment;
  const payload = JSON.parse(payment.invoice_payload);
  
  console.log('💰 Успешная оплата:', payload);
  
  try {
    let command;
    
    if (payload.type === 'rank') {
      const rank = ranksConfig.ranks[payload.item];
      command = rank.command.replace('{nickname}', payload.nickname);
    } else if (payload.type === 'service') {
      const service = servicesConfig.services[payload.item];
      command = service.command.replace('{nickname}', payload.nickname);
    } else if (payload.type === 'relics') {
      command = servicesConfig.relics.command
        .replace('{nickname}', payload.nickname)
        .replace('{amount}', payload.amount);
    }
    
    console.log('📝 RCON команда:', command);
    
    try {
      const response = await executeRconCommand(command);
      console.log('✅ RCON ответ:', response);
      
      const message = telegramConfig.messages.payment_success
        .replace('{nickname}', payload.nickname);
      
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
    } catch (rconError) {
      console.error('❌ RCON ошибка:', rconError);
      
      const message = telegramConfig.messages.payment_pending
        .replace('{nickname}', payload.nickname);
      
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }
    
    delete userSessions[chatId];
    
  } catch (error) {
    console.error('❌ Ошибка обработки платежа:', error);
    await bot.sendMessage(chatId, telegramConfig.messages.payment_error);
  }
});

// Запуск сервера
const PORT = process.env.PORT || serverConfig.api.port;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend сервер запущен на http://localhost:${PORT}`);
  console.log(`🤖 Telegram бот @${telegramConfig.bot.username} работает (polling mode)`);
  console.log(`\n📋 Доступные endpoints:`);
  console.log(`   GET  /api/health         - Статус сервера`);
  console.log(`   GET  /api/ranks          - Список привилегий`);
  console.log(`   GET  /api/services       - Список услуг`);
  console.log(`   GET  /api/server-status  - Статус Minecraft сервера`);
});
