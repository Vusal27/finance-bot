const TelegramApi = require('node-telegram-bot-api');
const { getWeekData, showCurrentBalance, calcAndUpdateBD, attention, validInteger } = require('./helpers');
const { start } = require('./start');
const { DATA_BASE } = require('./dataBase');
const { MENU_BUTTONS, onClick } = require('./buttons');
require('dotenv').config()

const financeBot = new TelegramApi(process.env.TOKEN, { polling: true });
financeBot.setMyCommands = [
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/menu', description: 'Меню бота' }
]

const accumulate = (chatId, msg) => {
    return validInteger(financeBot, chatId, msg.text).then((amount) => {
        const { currentWeekId, weekName } = getWeekData();
        calcAndUpdateBD(currentWeekId, weekName, amount).then((type) => {
            attention(financeBot, chatId, msg);
            if (type) {
                showCurrentBalance(chatId, financeBot, type);
            }
        });
    })
}

const init = () => {
    financeBot.on('message', msg =>  {
        const chatId = msg.chat.id;
        console.log(msg, chatId);
        start(chatId, msg, financeBot).then(() => {
            if (msg.text === '/menu') {
                return financeBot.sendMessage(chatId, 'Menu', MENU_BUTTONS);
            }
            if (msg.text === 'reset balance') {
                DATA_BASE.accounts[DATA_BASE.user].currentWeek = { id: '', name: '', amount: 0 };
                DATA_BASE.accounts[DATA_BASE.user].currentMonth = { id: '', name: '', amount: 0 };
                return financeBot.sendMessage(chatId, `Balance reseted!`);
            }
            if (DATA_BASE.state === 'changeLimit') {
                return validInteger(financeBot, chatId, msg.text).then((amount) => {
                    DATA_BASE.accounts[DATA_BASE.user].limits.week = amount;
                    DATA_BASE.accounts[DATA_BASE.user].limits.month = amount * 4;
                    DATA_BASE.state = '';
                    financeBot.sendMessage(chatId, `Limit changed! New limits: weekly ${amount}, monthly ${amount * 4}!`);
                }).catch(() => null);
            }
            accumulate(chatId, msg);
        })
    });

    financeBot.on('callback_query', msg => {
        const chatId = msg.message.chat.id;
        onClick(financeBot, chatId, msg.data);
    });
}

init();