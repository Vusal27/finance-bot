const { DATA_BASE } = require('./dataBase');

module.exports = {
    start: (chatId, msg, financeBot) => {
        return new Promise((res) => {
            if (msg.text === '/start') {
                DATA_BASE.justStarted = true;
                return financeBot.sendMessage(chatId, 'Before using FinanceBot, set a limit per week, in the format "limit: 100" (only an integer)');
            }
            if (DATA_BASE.justStarted) {
                const limit = +msg.text.toLowerCase().replace('limit:', '').trim();
                if (!msg.text.toLowerCase().includes('limit:') || !limit) {
                    return financeBot.sendMessage(chatId, 'Wrong format, try again!');
                } else {
                    DATA_BASE.justStarted = false;
                    DATA_BASE.limits = { week: limit, month: limit * 4 };
                    return financeBot.sendMessage(chatId, `Great! You have set the following limits: weekly ${limit}, monthly ${limit * 4}!`);
                }
            }
            res();
        })
    }
};
