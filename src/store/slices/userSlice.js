export const createUserSlice = (set) => ({
    profileData: { name: '', imageUrl: '', coins: 0 },
    performanceTarget: null,
    user: null, // Global user object

    setProfileData: (data) => set({ profileData: data }),
    setPerformanceTarget: (data) => set({ performanceTarget: data }),
    setUser: (user) => set({ user }),
});
