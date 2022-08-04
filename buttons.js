const { showCurrentBalance, toFormat, showCurrentBalanceDetails } = require('./helpers');
const { DATA_BASE } = require('./dataBase');

module.exports = {
    LOGIN_BUTTONS: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Create', callback_data: 'create' },
                    { text: 'Log in', callback_data: 'login' }
                ]
            ]
        })
    },
    MENU_BUTTONS: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Change Limits', callback_data: 'changeLimit' },
                    { text: 'Balance', callback_data: 'showBalance' },
                    { text: 'Balance Details', callback_data: 'BalanceDetails' }
                ],
                [
                    { text: 'History by week', callback_data: 'showWeekHistory' },
                    { text: 'History by month', callback_data: 'showMonthHistory' }
                ]
            ]
        })
    },
    onClick: (financeBot, chatId, data) => {
        if (data === 'create') {
            DATA_BASE.state = 'create';
            return financeBot.sendMessage(chatId, 'Enter account name(must not contain spaces) and password separated by a space!');
        }
        if (data === 'login') {
            DATA_BASE.state = 'login';
            return financeBot.sendMessage(chatId, 'Enter your account name and password separated by a space!');
        }
        if (data === 'showBalance') {
            return showCurrentBalance(chatId, financeBot);
        }
        if (data === 'BalanceDetails') {
            if (DATA_BASE.accounts[DATA_BASE.user].currentWeek.id) {
                const details = { week: DATA_BASE.accounts[DATA_BASE.user].currentWeek.week, amount: DATA_BASE.accounts[DATA_BASE.user].currentWeek.amount, limit: DATA_BASE.accounts[DATA_BASE.user].limits.week };
                showCurrentBalanceDetails(chatId, financeBot, `${toFormat(details)}`);
            }
            if (DATA_BASE.accounts[DATA_BASE.user].currentMonth.id) {
                const details = { month: DATA_BASE.accounts[DATA_BASE.user].currentMonth.month, amount: DATA_BASE.accounts[DATA_BASE.user].currentMonth.amount, limit: DATA_BASE.accounts[DATA_BASE.user].limits.month };
                return showCurrentBalanceDetails(chatId, financeBot, `${toFormat(details)}`);
            }
            financeBot.sendMessage(chatId, 'Details are available after the first transaction!');
        }
        if (data === 'changeLimit') {
            financeBot.sendMessage(chatId, 'Enter new limit (only an integer)');
            DATA_BASE.state = 'changeLimit';
        }
        if (data === 'showWeekHistory') {
            if (!DATA_BASE.accounts[DATA_BASE.user].history.weeks.length) {
                return financeBot.sendMessage(chatId, `<b>Week history</b>`, { parse_mode: 'HTML' }).then(() => {
                    financeBot.sendMessage(chatId, 'No history yet');
                });
            }
            const history = DATA_BASE.accounts[DATA_BASE.user].history.weeks.map((item) => ({ Period: item.name, Spent: item.amount, limit: item.limit }));
            financeBot.sendMessage(chatId, `<b>Week history</b>`, { parse_mode: 'HTML' }).then(() => {
                financeBot.sendMessage(
                    chatId,
                    toFormat(history),
                    { parse_mode: 'HTML' }
                );
            })
        }
        if (data === 'showMonthHistory') {
            if (!DATA_BASE.accounts[DATA_BASE.user].history.months.length) {
                return financeBot.sendMessage(chatId, `<b>Month history</b>`, { parse_mode: 'HTML' }).then(() => {
                    financeBot.sendMessage(chatId, 'No history yet');
                })
            }
            const history = DATA_BASE.accounts[DATA_BASE.user].history.months.map((item) => ({ Month: item.name, Spent: item.amount, limit: item.limit }));
            financeBot.sendMessage(chatId, `<b>Month history</b>`, { parse_mode: 'HTML' }).then(() => {
                financeBot.sendMessage(
                    chatId,
                    JSON.stringify(history)
                        .replaceAll('},{', '\n')
                        .replaceAll('{', '')
                        .replaceAll('}', '')
                        .replaceAll('[', '')
                        .replaceAll(']', '')
                        .replaceAll('"', '')
                        .replaceAll(',', ' , '),
                    { parse_mode: 'HTML' }
                );
            });
        }
    }
}
