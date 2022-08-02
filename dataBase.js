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
        currentWeek: { id: '', week: '', amount: 0 },
        currentMonth: { id: '', month: '', amount: 0 }
    }
};
