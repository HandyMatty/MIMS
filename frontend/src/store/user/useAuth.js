import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUserAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      role: null,
      token: null,
      setUserData: (userData) => set({ userData }),
      setRole: (role) => set({ role }),  // Set the role
      setToken: (token) => set({ token }),
      reset: () => set({ userData: null, role: null, token: null }),  // Reset the role as well
    }),
    {
      name: "userAuth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

