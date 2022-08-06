const { DATA_BASE, defaultAccount } = require('./dataBase');
const { LOGIN_BUTTONS } = require('./buttons');

module.exports = {
    start: (chatId, msg, financeBot) => {
        return new Promise((res) => {
            if (msg.text === '/start' || DATA_BASE.state === 'start' || !DATA_BASE.state) {
                DATA_BASE.state = 'start';
                return financeBot.sendMessage(chatId, 'Before using FinanceBot, create or log in to a financial account', LOGIN_BUTTONS);
            }
            if (DATA_BASE.state === 'create') {
                const [userName, userPassword] = msg.text.split(' ');
                if (!userName || !userPassword) {
                    return financeBot.sendMessage(chatId, 'Wrong format, try again!');
                }
                const user = DATA_BASE.accountList.find(({ name, password }) => name === userName && password === userPassword);
                if (user) {
                    return financeBot.sendMessage(chatId, `Account already exist!`);
                }
                DATA_BASE.accountList.push({ name: userName, password: userPassword });
                DATA_BASE.user = userName;
                DATA_BASE.accounts[userName] = { ...defaultAccount };
                financeBot.sendMessage(chatId, `Your name: ${userName}, your password: ${userPassword}!`);
                if (DATA_BASE.accounts[DATA_BASE.user].limits.week === 0) {
                    DATA_BASE.state = 'setLimit';
                    return financeBot.sendMessage(chatId, 'Set a limit per week, in the format "limit: 100" (only an integer)');
                }
                DATA_BASE.state = 'readyToUse';
            }
            if (DATA_BASE.state === 'login') {
                const [userName, userPassword] = msg.text.split(' ');
                if (!userName || !userPassword) {
                    return financeBot.sendMessage(chatId, 'Wrong format, try again!');
                }
                const user = DATA_BASE.accountList.find(({ name, password }) => name === userName && password === userPassword);
                if (!user) {
                    return financeBot.sendMessage(chatId, `Incorrect name or password!`);
                }
                DATA_BASE.user = userName;
                financeBot.sendMessage(chatId, `You are logged in to your account!`);
                if (DATA_BASE.accounts[DATA_BASE.user].limits.week === 0) {
                    DATA_BASE.state = 'setLimit';
                    return financeBot.sendMessage(chatId, 'Set a limit per week, in the format "limit: 100" (only an integer)');
                }
                DATA_BASE.state = 'readyToUse';
                return;
            }
            if (DATA_BASE.state === 'setLimit') {
                const limit = +msg.text.toLowerCase().replace('limit:', '').trim();
                if (!msg.text.toLowerCase().includes('limit:') || !limit || limit < 1) {
                    return financeBot.sendMessage(chatId, 'Wrong format, try again!');
                } else {
                    DATA_BASE.state = 'readyToUse';
                    DATA_BASE.accounts[DATA_BASE.user].limits = { week: limit, month: limit * 4 };
                    return financeBot.sendMessage(chatId, `Great! You have set the following limits: weekly ${limit}, monthly ${limit * 4}!`);
                }
            }
            if (DATA_BASE.state === 'readyToUse') {
                res();
            }
        })
    }
};
