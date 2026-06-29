// Копирование IP адреса
function copyIP() {
    const ipText = document.getElementById('ipText').textContent;
    navigator.clipboard.writeText(ipText).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Получение статуса сервера для отображения IP
async function refreshStatus() {
    try {
        const response = await fetch('/api/server-status');
        const data = await response.json();
        
        if (data.online) {
            document.getElementById('ipText').textContent = `${data.ip}:${data.port}`;
        }
    } catch (error) {
        console.error('Ошибка получения статуса:', error);
    }
}

// Ползунок риликов
const relicsSlider = document.getElementById('relicsSlider');
const relicsAmount = document.getElementById('relicsAmount');
const relicsPrice = document.getElementById('relicsPrice');

if (relicsSlider) {
    relicsSlider.addEventListener('input', function() {
        const amount = this.value;
        const price = amount / 2;
        relicsAmount.textContent = parseInt(amount).toLocaleString();
        relicsPrice.textContent = price + '₽';
    });
}

// Покупка риликов
function buyRelics() {
    const amount = document.getElementById('relicsSlider').value;
    const price = Math.ceil(amount / 5);
    
    window.location.href = `payment.html?type=relics&amount=${amount}&price=${price}`;
}

// Покупка размута
function buyUnmute() {
    window.location.href = 'payment.html?type=unmute';
}

// Покупка разбана
function buyUnban() {
    window.location.href = 'payment.html?type=unban';
}

// RCON авторизация
let rconPassword = '';

// Функция открытия доната с формой никнейма
let selectedRank = '';
let selectedPrice = 0;

const rankPrices = {
    'hero': 9,
    'titan': 17,
    'avenger': 25,
    'overlord': 50,
    'minister': 115,
    'imperator': 199,
    'daemon': 359,
    'cobra': 599,
    'god': 999
};

function openDonate(rank) {
    selectedRank = rank;
    selectedPrice = rankPrices[rank];
    
    window.location.href = `payment.html?type=rank&item=${rank}`;
}

// Функция для обработки платежа (настроить в PAYMENT_SETUP.md)
async function processDonatePayment(nickname, rank, price) {
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, rank, price })
        });
        
        const data = await response.json();
        
        if (data.paymentUrl) {
            window.open(data.paymentUrl, '_blank');
        }
    } catch (error) {
        console.error('Ошибка создания платежа:', error);
        alert('Ошибка создания платежа. Свяжитесь с администрацией.');
    }
}
// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    refreshStatus();
    
    // Инициализация ползунка риликов
    const relicsSlider = document.getElementById('relicsSlider');
    const relicsAmount = document.getElementById('relicsAmount');
    const relicsPrice = document.getElementById('relicsPrice');
    
    if (relicsSlider) {
        relicsSlider.addEventListener('input', function() {
            const amount = this.value;
            const price = Math.ceil(amount / 5);
            relicsAmount.textContent = parseInt(amount).toLocaleString();
            relicsPrice.textContent = price + '₽';
        });
    }
});
