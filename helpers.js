const { DATA_BASE } = require('./dataBase');

module.exports = {
    validInteger: (financeBot, chatId, value) => {
        const amount = Number(value);
        if (!amount || !Number.isInteger(amount)) {
            return financeBot.sendMessage(chatId, 'Please enter an integer')
                .then(() => {
                    return Promise.reject();
                })
        }
        return Promise.resolve(amount);
    },
    attention: (financeBot, chatId, msg) => {
        const name = msg.from.first_name;
        const leftWeek = DATA_BASE.limits.week - DATA_BASE.currentWeek.amount;
        const leftMonth = DATA_BASE.limits.month - DATA_BASE.currentMonth.amount;
        if (leftWeek < 0) {
            financeBot.sendMessage(chatId, `<b>${name.toUpperCase()} STOP!</b> OVERSPENDING FOR THIS WEEK IS ${Math.abs(leftWeek)}`, { parse_mode: 'HTML' });
            financeBot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/045/dde/045ddec3-882f-3d37-814b-d18cbbc6d583/4.webp');
        } else if (leftWeek < DATA_BASE.limits.week * 0.1) {
            financeBot.sendMessage(chatId, `<b>${name.toUpperCase()} ATTENTION!</b> THERE ARE ${leftWeek} LEFT THIS WEEK`, { parse_mode: 'HTML' });
        }
        if (leftMonth < 0) {
            financeBot.sendMessage(chatId, `<b>${name.toUpperCase()} STOP!</b> OVERSPENDING FOR THIS MONTH IS ${Math.abs(leftMonth)}`, { parse_mode: 'HTML' });
            if  (leftWeek >= 0) {
                financeBot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/045/dde/045ddec3-882f-3d37-814b-d18cbbc6d583/4.webp');
            }
        } else if (leftMonth < DATA_BASE.limits.month * 0.1) {
            financeBot.sendMessage(chatId, `<b>${name.toUpperCase()} ATTENTION!</b> THERE ARE ${leftMonth} LEFT THIS MONTH`, { parse_mode: 'HTML' });
        }
    },
    calcAndUpdateBD: (currentWeekId, weekName, amount) => {
        let showBalanceType;
        if (DATA_BASE.currentWeek.id === currentWeekId) {
            DATA_BASE.currentWeek.amount = DATA_BASE.currentWeek.amount + amount
        } else {
            if (!!DATA_BASE.currentWeek.id) {
                showBalanceType = 'week';
                DATA_BASE.history.weeks.push({ ...DATA_BASE.currentWeek, limit: DATA_BASE.limits.week });
            }
            DATA_BASE.currentWeek = {
                id: currentWeekId,
                week: weekName,
                amount
            }
        }
        const currentMonthId = new Date().toLocaleDateString().slice(3);
        if (DATA_BASE.currentMonth.id === currentMonthId) {
            DATA_BASE.currentMonth.amount = DATA_BASE.currentMonth.amount + amount;
        } else {
            if (!!DATA_BASE.currentMonth.id) {
                showBalanceType = !showBalanceType ? 'month' : 'all';
                DATA_BASE.history.months.push({ ...DATA_BASE.currentMonth, limit: DATA_BASE.limits.month });
            }
            DATA_BASE.currentMonth = {
                id: currentMonthId,
                month: new Date().toLocaleString('en', { month: 'long' }),
                amount
            }
        }

        return Promise.resolve(showBalanceType);
    },
    toFormat: (value) => {
        return JSON.stringify(value)
        .replaceAll('},{', '\n')
        .replaceAll('{', '')
        .replaceAll('}', '')
        .replaceAll('[', '')
        .replaceAll(']', '')
        .replaceAll('"', '')
        .replaceAll(',', ' , ');
    },
    showCurrentBalanceDetails: (chatId, financeBot, text) => {
        financeBot.sendMessage(chatId, text);
    },
    showCurrentBalance: (chatId, financeBot, type = 'all') => {
        let resolve;
        const readyPromise = new Promise((res) => {
            resolve = res;
        });
        const weekAvailable = DATA_BASE.limits.week - DATA_BASE.currentWeek.amount;
        if (type === 'week' || type === 'all') {
            if (weekAvailable >= 0) {
                financeBot.sendMessage(chatId, `Week - ${DATA_BASE.currentWeek.amount} spent, ${weekAvailable} available!`).then(() => resolve());
            } else {
                financeBot.sendMessage(chatId, `Week - ${DATA_BASE.currentWeek.amount} spent, OVER LIMIT ON ${Math.abs(weekAvailable)}!`).then(() => resolve());
            }
        }
        if (type === 'month' || type === 'all') {
            return readyPromise.then(() => {
                const monthAvailable = DATA_BASE.limits.month - DATA_BASE.currentMonth.amount;
                if (monthAvailable >= 0) {
                    return financeBot.sendMessage(chatId, `Month - ${DATA_BASE.currentMonth.amount} spent, ${monthAvailable} available!`);
                } else {
                    return financeBot.sendMessage(chatId, `Month - ${DATA_BASE.currentMonth.amount} spent, OVER LIMIT ON ${Math.abs(monthAvailable)}!`);
                }
            })
        }
    },
    getWeekData: () => {
        const result = {};
        const d = new Date();
        const today = d.getDate();
        const currentWeekDay = d.getDay() === 0 ? 6 : d.getDay() - 1;
        if (today < currentWeekDay) {
            const daysInPrevMonth = getDaysInMonth .getDaysInMonth(d.getMonth() - 1);
            result.weekStartDay = daysInPrevMonth - (currentWeekDay - today);
        } else {
            result.weekStartDay = today - currentWeekDay;
        }
    
        const daysInCurrentMonth = getDaysInMonth(d.getMonth());
        const lostDaysInWeek = 6 - currentWeekDay;
        const lostDaysInMonth = daysInCurrentMonth - (today - 1);
        if  (lostDaysInMonth < lostDaysInWeek) {
            result.weekEndDay = lostDaysInWeek - lostDaysInMonth;
        } else {
            result.weekEndDay = today + lostDaysInWeek;
        }
    
        const currentMonthName = new Date().toLocaleString('en', { month: 'long' });
        if (result.weekEndDay < result.weekStartDay) {
            const isNext = today <= result.weekEndDay;
            const prevOrNextMonth = new Date(d.getFullYear(), (d.getMonth() + (isNext ? -1 : 1)), 30).toLocaleString('en', { month: 'long' });
            const firstMonthName = isNext ? prevOrNextMonth : currentMonthName;
            const secondMonthName = isNext ? currentMonthName : prevOrNextMonth;
            result.weekName = `${result.weekStartDay} ${firstMonthName} - ${result.weekEndDay} ${secondMonthName} (${d.getFullYear()})`;
            result.currentWeekId = result.weekName.replace(/\s/g, '');
        } else {
            result.weekName = `${result.weekStartDay} ${currentMonthName} - ${result.weekEndDay} ${currentMonthName} (${d.getFullYear()})`;
            result.currentWeekId = result.weekName.replace(/\s/g, '');
        }
    
        return result;
    }
};

const getDaysInMonth = (monthIndex) => {
    return 32 - new Date(new Date().getFullYear(), monthIndex, 32).getDate();
}