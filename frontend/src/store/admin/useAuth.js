import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      role: null,
      token: null,
      setUserData: (userData) => set({ userData }),
      setRole: (role) => set({ role }),
      setToken: (token) => set({ token }),
      reset: () => {
        set({ userData: null, role: null, token: null });
        localStorage.removeItem("adminAuth"); // Manually remove storage entry
      },
    }),
    {
      name: "adminAuth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
