module.exports = {
    DATA_BASE: {
        state: '',
        accountList: [],
        accounts: {},
        user: null
    },
    defaultAccount: {
        limits: {
            week: 0,
            month: 0
        },
        history: {
            weeks: [],
            months: [],
            tx: []
        },
        currentWeek: { id: '', week: '', amount: 0 },
        currentMonth: { id: '', month: '', amount: 0 }
    }
};
