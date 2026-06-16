import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  activeOrganization: Organization | null;
  setAuth: (token: string, user: User) => void;
  setActiveOrganization: (org: Organization) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeOrganization: null,
      setAuth: (token, user) => set({ token, user }),
      setActiveOrganization: (activeOrganization) => set({ activeOrganization }),
      logout: () => set({ token: null, user: null, activeOrganization: null }),
    }),
    {
      name: "businessos-auth",
    }
  )
);
