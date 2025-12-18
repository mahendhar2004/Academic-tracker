export const createDataSlice = (set) => ({
    tasks: [],
    contacts: [],
    expenditures: [],
    scenarios: [],

    setTasks: (data) => set({ tasks: data }),
    setContacts: (data) => set({ contacts: data.sort((a, b) => a.name.localeCompare(b.name)) }),
    setExpenditures: (data) => set({ expenditures: data }),
    setScenarios: (data) => set({ scenarios: data }),
});
