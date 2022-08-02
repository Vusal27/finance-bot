const TelegramApi = require('node-telegram-bot-api');
const { getWeekData, showCurrentBalance, calcAndUpdateBD, attention, validInteger } = require('./helpers');
const { start } = require('./start');
const { DATA_BASE } = require('./dataBase');
const { BUTTONS, onClick } = require('./buttons');
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
                return financeBot.sendMessage(chatId, 'Menu', BUTTONS);
            }
            if (DATA_BASE.changeLimit) {
                return validInteger(financeBot, chatId, msg.text).then((amount) => {
                    DATA_BASE.limits.week = amount;
                    DATA_BASE.limits.month = amount * 4;
                    DATA_BASE.changeLimit = false;
                    financeBot.sendMessage(chatId, `Limit changed! New limits: weekly ${amount}, monthly ${amount * 4}!`);
                });
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