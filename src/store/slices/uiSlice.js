export const createUiSlice = (set, get) => ({
    theme: localStorage.getItem('theme') || 'dark', // 'light' | 'dark'

    toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        set({ theme: newTheme });

        // Directly manipulate DOM for instant feedback if needed, 
        // though typically handled in App.jsx effect
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    toast: { show: false, message: '', type: 'success' },

    showToast: (message, type = 'success') => {
        set({ toast: { show: true, message, type } });
    },

    hideToast: () => {
        set((state) => ({ toast: { ...state.toast, show: false } }));
    },

    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({ theme });
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});
