# Руководство по развертыванию Deltaworld

## Развертывание на VPS (Ubuntu/Debian)

### 1. Подготовка сервера

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установите PM2 для управления процессом
sudo npm install -g pm2

# Установите Nginx (опционально, для reverse proxy)
sudo apt install -y nginx
```

### 2. Загрузите проект

```bash
# Клонируйте или загрузите ваш проект
cd /var/www/
sudo mkdir deltaworld
sudo chown $USER:$USER deltaworld
cd deltaworld

# Разместите здесь файлы проекта
```

### 3. Настройте переменные окружения

```bash
nano .env
```

Заполните настройки:
```
PORT=3000
RCON_HOST=127.0.0.1
RCON_PORT=25575
RCON_PASSWORD=ваш_секретный_пароль
MC_SERVER_IP=play.deltaworld.ru
MC_SERVER_PORT=25565
```

### 4. Установите зависимости и запустите

```bash
npm install
pm2 start server.js --name deltaworld
pm2 save
pm2 startup
```

### 5. Настройте Nginx (опционально)

```bash
sudo nano /etc/nginx/sites-available/deltaworld
```

Добавьте конфигурацию:
```nginx
server {
    listen 80;
    server_name deltaworld.ru www.deltaworld.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/deltaworld /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Настройте SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d deltaworld.ru -d www.deltaworld.ru
```

## Развертывание на Windows Server

### 1. Установите Node.js
Скачайте и установите с https://nodejs.org/

### 2. Установите PM2
```cmd
npm install -g pm2
npm install -g pm2-windows-service
pm2-service-install
```

### 3. Разместите проект
Скопируйте файлы проекта в папку, например `C:\inetpub\deltaworld\`

### 4. Настройте .env файл
Создайте `.env` с вашими настройками

### 5. Запустите сервис
```cmd
cd C:\inetpub\deltaworld
npm install
pm2 start server.js --name deltaworld
pm2 save
```

## Обновление проекта

```bash
cd /var/www/deltaworld
git pull  # если используете git
npm install
pm2 restart deltaworld
```

## Мониторинг

```bash
# Просмотр логов
pm2 logs deltaworld

# Статус
pm2 status

# Мониторинг ресурсов
pm2 monit
```

## Безопасность

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Ограничение доступа к RCON консоли

В `server.js` добавьте проверку IP или JWT токенов:

```javascript
// Middleware для проверки IP
const allowedIPs = ['127.0.0.1', 'ваш_ip'];

app.use('/api/rcon-command', (req, res, next) => {
    const clientIP = req.ip;
    if (!allowedIPs.includes(clientIP)) {
        return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
});
```

## Резервное копирование

Настройте регулярное резервное копирование:

```bash
# Создайте скрипт backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/deltaworld_$DATE.tar.gz /var/www/deltaworld
# Удалите старые бэкапы (старше 30 дней)
find /backup -name "deltaworld_*.tar.gz" -mtime +30 -delete
```

Добавьте в crontab:
```bash
crontab -e
# Добавьте строку для ежедневного бэкапа в 3 часа ночи
0 3 * * * /path/to/backup.sh
```

## Производительность

### Увеличьте лимиты PM2
```bash
pm2 start server.js --name deltaworld --max-memory-restart 500M
```

### Включите компрессию в Express

В `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

Установите:
```bash
npm install compression
```

## Поддержка

При проблемах проверьте:
- Логи PM2: `pm2 logs deltaworld`
- Статус процесса: `pm2 status`
- Доступность RCON порта на Minecraft сервере
- Firewall правила
- Настройки .env файла
