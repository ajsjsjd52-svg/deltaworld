// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const item = urlParams.get('item');
const amount = urlParams.get('amount');

let nickname = '';
let selectedMethod = '';
let purchasePrice = 0;

// Отображаем информацию о покупке
document.addEventListener('DOMContentLoaded', () => {
    displayPurchaseInfo();
});

function displayPurchaseInfo() {
    const titleEl = document.getElementById('purchaseTitle');
    
    if (type === 'rank') {
        const rankNames = {
            'hero': 'HERO', 'titan': 'TITAN', 'avenger': 'AVENGER',
            'overlord': 'OVERLORD', 'minister': 'MINISTER', 'imperator': 'IMPERATOR',
            'daemon': 'DAEMON', 'cobra': 'COBRA', 'god': 'GOD'
        };
        
        const rankPrices = {
            'hero': 9, 'titan': 17, 'avenger': 25, 'overlord': 50,
            'minister': 115, 'imperator': 199, 'daemon': 359,
            'cobra': 599, 'god': 999
        };
        
        titleEl.textContent = `Привилегия ${rankNames[item]}`;
        purchasePrice = rankPrices[item];
        
    } else if (type === 'relics') {
        titleEl.textContent = `${parseInt(amount).toLocaleString()} риликов`;
        purchasePrice = Math.ceil(amount / 5);
        
    } else if (type === 'unmute') {
        titleEl.textContent = 'Размут';
        purchasePrice = 15;
        
    } else if (type === 'unban') {
        titleEl.textContent = 'Разбан';
        purchasePrice = 150;
    }
    
    document.getElementById('purchasePrice').textContent = `${purchasePrice}₽`;
}

// Показать методы оплаты (остаемся на белом фоне)
function showPaymentMethods() {
    const nicknameInput = document.getElementById('nicknameInput');
    nickname = nicknameInput.value.trim();
    
    if (!nickname) {
        alert('Пожалуйста, введите ваш игровой никнейм');
        nicknameInput.focus();
        return;
    }
    
    if (nickname.length < 3) {
        alert('Никнейм слишком короткий');
        nicknameInput.focus();
        return;
    }
    
    // Скрываем форму никнейма, показываем методы оплаты
    document.getElementById('nicknameSection').style.display = 'none';
    document.getElementById('paymentMethodsSection').style.display = 'block';
}

// Вернуться к форме никнейма
function showNicknameForm() {
    document.getElementById('paymentMethodsSection').style.display = 'none';
    document.getElementById('nicknameSection').style.display = 'block';
}

// Вернуться к методам оплаты с деталей
function backToPaymentMethods() {
    document.getElementById('paymentDetailsSection').style.display = 'none';
    document.getElementById('paymentMethodsSection').style.display = 'block';
}

// Выбор способа оплаты
function selectPaymentMethod(method) {
    selectedMethod = method;
    document.getElementById('paymentMethodsSection').style.display = 'none';
    document.getElementById('paymentDetailsSection').style.display = 'flex';
    
    showPaymentDetails(method);
}

// Показать детали оплаты
function showPaymentDetails(method) {
    const detailsContent = document.getElementById('detailsContent');
    const methodTitle = document.getElementById('methodTitle');
    
    const methodTitles = {
        'sbp': 'Система быстрых платежей',
        'mir': 'Карты России и МИР',
        'yoomoney': 'ЮMoney',
        'visa-master': 'Карты Visa и Mastercard',
        'foreign-cards': 'Зарубежные карты №2',
        'telegram': 'Telegram Stars',
        'cryptobot': 'Cryptobot'
    };
    
    methodTitle.textContent = methodTitles[method] || 'Оплата';
    
    if (method === 'mir' || method === 'foreign-cards') {
        // Перевод на карту
        detailsContent.innerHTML = `
            <div class="card-details-info">
                <div class="card-item">
                    <div class="card-label">
                        <span class="card-badge badge-mir">МИР</span>
                        Карта для РФ
                    </div>
                    <div class="card-number-display">
                        <input type="text" class="card-number-text" value="5394 2801 5424 7473" readonly id="cardRU">
                        <button class="copy-btn" onclick="copyCard('cardRU')">Скопировать</button>
                    </div>
                </div>
                
                <div class="card-item">
                    <div class="card-label">
                        <span style="font-size: 1.5rem;">🇺🇦</span>
                        Резервная карта (Украина)
                    </div>
                    <div class="card-number-display">
                        <input type="text" class="card-number-text" value="4874 0700 7193 6866" readonly id="cardUA">
                        <button class="copy-btn" onclick="copyCard('cardUA')">Скопировать</button>
                    </div>
                </div>
            </div>
            
            <div class="instructions">
                <h4>Инструкция по оплате:</h4>
                <ol>
                    <li>Скопируйте номер карты</li>
                    <li>Переведите <strong>${purchasePrice}₽</strong></li>
                    <li>Нажмите "Я оплатил" ниже</li>
                    <li>Свяжитесь с администрацией</li>
                </ol>
            </div>
            
            <div class="contact-note">
                Никнейм: <strong>${nickname}</strong>
            </div>
        `;
    } else if (method === 'telegram') {
        // Формируем параметр для бота
        let botStartParam = 'pay';
        
        if (type === 'rank') {
            // Формат: pay_rank_hero_Steve_9
            botStartParam = `pay_rank_${item}_${nickname}_${purchasePrice}`;
        } else if (type === 'unmute') {
            // Формат: pay_service_unmute_Steve_15
            botStartParam = `pay_service_unmute_${nickname}_${purchasePrice}`;
        } else if (type === 'unban') {
            // Формат: pay_service_unban_Steve_150
            botStartParam = `pay_service_unban_${nickname}_${purchasePrice}`;
        } else if (type === 'relics') {
            // Формат: pay_relics_Steve_100_20
            botStartParam = `pay_relics_${nickname}_${amount}_${purchasePrice}`;
        }
        
        const botLink = `https://t.me/DeltaPayment_bot?start=${botStartParam}`;
        
        detailsContent.innerHTML = `
            <div class="online-payment-info">
                <h3>Оплата через Telegram Stars</h3>
                <p>Сумма к оплате: <strong style="color: #4a9eff; font-size: 2rem;">${purchasePrice}⭐</strong></p>
                <p>Никнейм: <strong>${nickname}</strong></p>
                <p style="margin-top: 1rem; color: #b0c4de;">Оплата через бота Telegram</p>
                <a href="${botLink}" class="payment-link" target="_blank">Открыть бота DeltaPayment</a>
            </div>
            
            <div class="instructions">
                <h4>Инструкция:</h4>
                <ol>
                    <li>Нажмите "Открыть бота DeltaPayment"</li>
                    <li>Бот покажет детали вашей покупки</li>
                    <li>Нажмите кнопку "Pay ${purchasePrice}⭐"</li>
                    <li>Оплатите через Telegram Stars</li>
                    <li>Покупка будет выдана автоматически</li>
                </ol>
            </div>
            
            <div class="contact-note">
                💡 Курс: 1 звезда = 1 рубль для донатов и услуг
            </div>
        `;
    } else {
        // Онлайн оплата
        detailsContent.innerHTML = `
            <div class="online-payment-info">
                <h3>Онлайн оплата</h3>
                <p>Сумма к оплате: <strong style="color: #4a9eff; font-size: 2rem;">${purchasePrice}₽</strong></p>
                <p>Никнейм: <strong>${nickname}</strong></p>
                <p style="margin-top: 1rem; color: #b0c4de;">Вы будете перенаправлены на безопасную страницу оплаты</p>
                <a href="#" class="payment-link" onclick="processOnlinePayment('${method}')">Перейти к оплате</a>
            </div>
        `;
    }
}

// Копирование номера карты
function copyCard(cardId) {
    const cardInput = document.getElementById(cardId);
    cardInput.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Скопировано!';
    btn.style.background = '#00ff88';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Онлайн оплата
function processOnlinePayment(method) {
    // Здесь будет интеграция с платежной системой
    alert('Функция онлайн оплаты находится в разработке.\n\nИспользуйте "Перевод на карту" для оплаты.');
    return false;
}

// Завершение покупки
function completePurchase() {
    const purchaseData = {
        nickname: nickname,
        type: type,
        item: item,
        amount: amount,
        method: selectedMethod,
        price: purchasePrice,
        timestamp: new Date().toISOString()
    };
    
    console.log('Purchase data:', purchaseData);
    
    alert(`Спасибо за покупку, ${nickname}!\n\nПосле подтверждения оплаты администрацией, покупка будет автоматически выдана.\n\nСвяжитесь с администрацией для подтверждения.`);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}
