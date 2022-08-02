const { showCurrentBalance, toFormat, showCurrentBalanceDetails } = require('./helpers');
const { DATA_BASE } = require('./dataBase');

module.exports = {
    BUTTONS: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Change Limits', callback_data: 'changeLimit' },
                    { text: 'Balance', callback_data: 'showBalance' },
                    { text: 'Balance Details', callback_data: 'BalanceDetails' }
                ],
                [
                    { text: 'Week History', callback_data: 'showWeekHistory' },
                    { text: 'Month  History', callback_data: 'showMonthHistory' }
                ]
            ]
        })
    },
    
    onClick: (financeBot, chatId, data) => {
        if (data === 'showBalance') {
            showCurrentBalance(chatId, financeBot);
        }
        if (data === 'BalanceDetails') {
            if (DATA_BASE.currentWeek.id) {
                const details = { week: DATA_BASE.currentWeek.week, amount: DATA_BASE.currentWeek.amount, limit: DATA_BASE.limits.week };
                showCurrentBalanceDetails(chatId, financeBot, `${toFormat(details)}`);
            }
            if (DATA_BASE.currentMonth.id) {
                const details = { month: DATA_BASE.currentMonth.month, amount: DATA_BASE.currentMonth.amount, limit: DATA_BASE.limits.month };
                return showCurrentBalanceDetails(chatId, financeBot, `${toFormat(details)}`);
            }
            financeBot.sendMessage(chatId, 'Details are available after the first transaction!');
        }
        if (data === 'changeLimit') {
            financeBot.sendMessage(chatId, 'Enter new limit (only an integer)');
            DATA_BASE.changeLimit = true;
        }
        if (data === 'showWeekHistory') {
            if (!DATA_BASE.history.weeks.length) {
                return financeBot.sendMessage(chatId, `<b>Week history</b>`, { parse_mode: 'HTML' }).then(() => {
                    financeBot.sendMessage(chatId, 'No history yet');
                });
            }
            const history = DATA_BASE.history.weeks.map((item) => ({ Period: item.name, Spent: item.amount, limit: item.limit }));
            financeBot.sendMessage(chatId, `<b>Week history</b>`, { parse_mode: 'HTML' }).then(() => {
                financeBot.sendMessage(
                    chatId,
                    toFormat(history),
                    { parse_mode: 'HTML' }
                );
            })
        }
        if (data === 'showMonthHistory') {
            if (!DATA_BASE.history.months.length) {
                return financeBot.sendMessage(chatId, `<b>Month history</b>`, { parse_mode: 'HTML' }).then(() => {
                    financeBot.sendMessage(chatId, 'No history yet');
                })
            }
            const history = DATA_BASE.history.months.map((item) => ({ Month: item.name, Spent: item.amount, limit: item.limit }));
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
