import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useGuestAuthStore = create(
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
        localStorage.removeItem("guestAuth");
      },
    }),
    {
      name: "guestAuth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

  