require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// Получаем токен бота из переменных окружения
const botToken = process.env.BOT_TOKEN;
const chatIdsString = process.env.CHAT_IDS;

if (!botToken) {
    console.error('Ошибка: BOT_TOKEN не найден в файле .env');
    process.exit(1);
}

if (!chatIdsString) {
    console.error('Ошибка: CHAT_IDS не найден в файле .env');
    process.exit(1);
}

// Парсим строку с chat_id в массив
const chatIds = chatIdsString.split(',').map(id => id.trim()).filter(id => id.length > 0);

if (chatIds.length === 0) {
    console.error('Ошибка: Не найдено ни одного валидного CHAT_ID');
    process.exit(1);
}

console.log(`Найдено ${chatIds.length} групп(ы) для отправки сообщений:`, chatIds);

// Создаем экземпляр бота
const bot = new TelegramBot(botToken, { polling: true });

// Массив различных утренних приветствий для разнообразия
const morningMessages = [
    '🌅 Доброе утро! Пусть этот день принесет вам много радости и успехов!',
    '☀️ Доброе утро, друзья! Новый день - новые возможности!',
    '🌞 Доброе утро! Желаю вам отличного настроения на весь день!',
    '🌄 Доброе утро! Пусть кофе будет крепким, а день продуктивным!',
    '🌻 Доброе утро! Начинаем день с позитивом и улыбкой!',
    '🌈 Доброе утро! Пусть этот день будет ярким и насыщенным!',
    '⭐ Доброе утро! Верьте в себя и идите к своим целям!',
    '🎯 Доброе утро! Новый день - новые достижения ждут вас!',
    '🍀 Доброе утро! Пусть удача сопутствует вам весь день!',
    '🥐 Доброе утро! Пусть завтрак будет вкусным, а день — добрым!',
    '🕊️ Доброе утро! Спокойствия, гармонии и прекрасного дня!',
    '🎉 Доброе утро! Пусть каждая минута сегодня будет наполнена радостью!',
    '💐 Доброе утро! Пусть на душе будет светло и приятно!',
    '👋 Доброе утро! Начинайте день с улыбкой и верой в свои силы!',
    '🔥 Доброе утро! Желаю энергии и вдохновения!',
    '☕ Доброе утро! Пусть этот кофе даст много сил и хорошего настроения!',
    '🌸 Доброе утро! Пусть этот день будет таким же прекрасным, как цветение весной!',
    '🦋 Доброе утро! Пусть легкость и счастье сопровождают вас сегодня!',
    '👑 Доброе утро! Королевского успеха и уверенности во всем!',
    '💡 Доброе утро! Пусть в голове будет свежо и появятся классные идеи!',
    '🍎 Доброе утро! Здоровья, бодрости и отличного самочувствия!',
    '🏆 Доброе утро! Побеждайте любые сложности и радуйтесь мелочам!',
    '🌠 Доброе утро! Пусть каждый новый рассвет вдохновляет на добрые поступки!',
    '🧩 Доброе утро! Пусть все дела сегодня сложатся как пазл!',
    '💫 Доброе утро! Пусть день будет волшебным и запоминающимся!',
    '🌺 Доброе утро! Пусть ваша доброта притянет только хороших людей и события!',
    '🐦 Доброе утро! Пусть сегодня настроение будет весёлым, как у певчих птиц!',
    '🥰 Доброе утро! Пусть сегодняшние моменты приносят только радость!',
    '🚀 Доброе утро! Вперёд к своим мечтам и целям!',
    '📈 Доброе утро! Пусть все ваши начинания сегодня принесут плоды!'
];

// Функция для получения случайного утреннего сообщения
function getRandomMorningMessage() {
    const randomIndex = Math.floor(Math.random() * morningMessages.length);
    return morningMessages[randomIndex];
}

// Функция для отправки утреннего сообщения во все группы
async function sendMorningMessageToAllChats() {
    const message = getRandomMorningMessage();
    const results = [];

    console.log(`Начинаем отправку утреннего сообщения в ${chatIds.length} групп(ы)...`);

    for (const chatId of chatIds) {
        try {
            await bot.sendMessage(chatId, message);
            console.log(`✅ Сообщение успешно отправлено в чат ${chatId}`);
            results.push({ chatId, status: 'success' });

            // Небольшая задержка между отправками, чтобы избежать лимитов Telegram
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`❌ Ошибка при отправке сообщения в чат ${chatId}:`, error.message);
            results.push({ chatId, status: 'error', error: error.message });

            // Проверяем типичные ошибки и даем советы
            if (error.message.includes('chat not found')) {
                console.log(`💡 Совет для чата ${chatId}: Убедитесь, что бот добавлен в группу и имеет права на отправку сообщений.`);
            } else if (error.message.includes('bot was blocked')) {
                console.log(`💡 Совет для чата ${chatId}: Бот был заблокирован в этой группе.`);
            } else if (error.message.includes('Too Many Requests')) {
                console.log(`💡 Совет: Слишком много запросов. Увеличьте задержку между отправками.`);
                // Увеличиваем задержку при получении этой ошибки
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    // Выводим общую статистику
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`📊 Статистика отправки: Успешно - ${successCount}, Ошибок - ${errorCount}`);
    console.log(`🕐 Время отправки: ${new Date().toLocaleString('ru-RU')}`);
}

// Настройка cron задания для отправки сообщения каждое утро в 8:00
cron.schedule('0 0 8 * * *', () => {
    console.log('⏰ Время отправить утренние приветствия во все группы!');
    sendMorningMessageToAllChats();
}, {
    scheduled: true,
    timezone: "Europe/Moscow" // Укажите ваш часовой пояс
});

// Обработчик команды /start для проверки работы бота
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Привет! Я бот для утренних приветствий. Каждое утро в 8:00 я буду отправлять доброе утро в ${chatIds.length} групп(ы)!`);
    console.log(`Получена команда /start от пользователя ${msg.from.username || msg.from.first_name}`);
});

// Обработчик команды /test для тестовой отправки утреннего сообщения
bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Запускаю тестовую отправку утренних сообщений...');
    console.log(`Получена команда /test от пользователя ${msg.from.username || msg.from.first_name} (id: ${msg.chat.id})`);
    sendMorningMessageToAllChats();
});

// Обработчик команды /status для проверки статуса групп
bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const statusMessage = `📋 Статус бота:\n\n` +
        `🔧 Настроено групп: ${chatIds.length}\n` +
        `📝 ID групп: ${chatIds.join(', ')}\n` +
        `⏰ Время отправки: 8:00 (Europe/Moscow)\n` +
        `📊 Всего приветствий: ${morningMessages.length}`;

    bot.sendMessage(chatId, statusMessage);
    console.log(`Получена команда /status от пользователя ${msg.from.username || msg.from.first_name}`);
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error.message);
});

console.log('🤖 Бот запущен успешно!');
console.log(`📱 Настроено ${chatIds.length} групп(ы) для отправки утренних сообщений`);
console.log('⏰ Расписание: каждый день в 8:00 (Europe/Moscow)');
console.log('💬 Доступные команды: /start, /test, /status');