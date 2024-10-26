import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUserAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      token: null,
      setUserData: (userData) => set({ userData }), // Corrected
      setToken: (token) => set({ token }),
      reset: () => set({ userData: null, token: null }),
    }),
    {
      name: "userAuth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

