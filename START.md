# Быстрый запуск

## 1. Настройка

Откройте `.env` и укажите данные вашего сервера:

```
RCON_HOST=localhost              # IP MC сервера
RCON_PORT=25575                  # RCON порт
RCON_PASSWORD=ваш_пароль         # Пароль RCON
MC_SERVER_IP=play.deltaworld.ru  # IP для отображения
MC_SERVER_PORT=25565             # Порт сервера
```

## 2. Настройка MC сервера

В `server.properties`:

```
enable-rcon=true
rcon.port=25575
rcon.password=ваш_пароль
```

Перезапустите MC сервер!

## 3. Установите плагин прав

Установите LuckPerms, PermissionsEx или GroupManager на ваш сервер.

Создайте группы для привилегий: hero, titan, avenger, overlord, minister, imperator, daemon, cobra, god

## 4. Запуск

```bash
npm start
```

Откройте: http://localhost:3000

## 5. Настройка оплаты

Смотрите `PAYMENT_SETUP.md` для подключения платежной системы.

После оплаты привилегии будут автоматически выдаваться через RCON!
