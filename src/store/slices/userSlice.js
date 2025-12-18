export const createUserSlice = (set) => ({
    profileData: { name: '', imageUrl: '', coins: 0 },
    performanceTarget: null,

    setProfileData: (data) => set({ profileData: data }),
    setPerformanceTarget: (data) => set({ performanceTarget: data }),
});
