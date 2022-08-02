const { showCurrentBalance } = require('./helpers');
const { DATA_BASE } = require('./dataBase');

module.exports = {
    BUTTONS: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Change Limits', callback_data: 'changeLimit' },
                    { text: 'Balance', callback_data: 'showBalance' }
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
