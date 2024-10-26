import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      token: null,
      setUserData: (userData) => set({ userData }), // Corrected
      setToken: (token) => set({ token }),
      reset: () => set({ userData: null, token: null }),
    }),
    {
      name: "adminAuth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
