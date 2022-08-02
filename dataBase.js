module.exports = {
    DATA_BASE: {
        limits: {
            week: 0,
            month: 0
        },
        justStarted: false,
        changeLimit: false,
        history: {
            weeks: [],
            months: []
        },
        currentWeek: { id: '', name: '', amount: 0 },
        currentMonth: { id: '', name: '', amount: 0 }
    }
};
