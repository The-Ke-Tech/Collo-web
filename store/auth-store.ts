import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =======================
   Types
======================= */
export type UserRole = "user" | "admin" | "super-admin";

export interface UserSession {
  id: string;
  name: string;
  email?: string | null;
  phone?: string;
  role: UserRole;
  createdAt?: string;
}

/* =======================
   Store Interface
======================= */
interface AuthState {
  user: UserSession | null;
  token: string | null;
  allUsers: UserSession[];

  setUser: (user: UserSession, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;

  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;

  updateUser: (updatedData: Partial<UserSession>) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;

  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

/* =======================
   Constants
======================= */
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/* =======================
   Helpers
======================= */
const decodeJWT = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const scheduleTokenRefresh = (token: string, refreshFn: () => void) => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return;

  const expiresAt = decoded.exp * 1000;
  const now = Date.now();
  const refreshTime = expiresAt - now - 15000; // 15s before expiry

  if (refreshTimer) clearTimeout(refreshTimer);

  if (refreshTime <= 0) {
    refreshFn();
  } else {
    refreshTimer = setTimeout(refreshFn, refreshTime);
  }
};

/* =======================
   Store
======================= */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const safeJson = async (res: Response) => {
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const refreshAccessToken = async (): Promise<string | null> => {
        if (!get().token) return null;

        try {
          const res = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { Authorization: `Bearer ${get().token}` },
          });

          if (!res.ok) {
            get().logout();
            return null;
          }

          const data = await safeJson(res);
          if (data?.token) {
            set({ token: data.token });
            scheduleTokenRefresh(data.token, refreshAccessToken);
            return data.token;
          }
          return null;
        } catch {
          get().logout();
          return null;
        }
      };

      const fetchWithAuth = async (input: RequestInfo, init?: RequestInit) => {
        let token = get().token;

        const decoded = token ? decodeJWT(token) : null;
        if (decoded && decoded.exp * 1000 - Date.now() < 15000) {
          token = await refreshAccessToken();
          if (!token) throw new Error("Session expired");
        }

        let res = await fetch(input, {
          ...init,
          headers: {
            ...(init?.headers || {}),
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          token = await refreshAccessToken();
          if (!token) throw new Error("Session expired");

          res = await fetch(input, {
            ...init,
            headers: {
              ...(init?.headers || {}),
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }

        return res;
      };

      return {
        user: null,
        token: null,
        allUsers: [],

        setUser: (user, token) => {
          set({ user, token });
          scheduleTokenRefresh(token, refreshAccessToken);
        },

        setToken: (token) => {
          set({ token });
          scheduleTokenRefresh(token, refreshAccessToken);
        },

        logout: () => {
          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = null;
          set({ user: null, token: null, allUsers: [] });
        },

        isLoggedIn: () => Boolean(get().user && get().token),
        isAdmin: () => get().user?.role === "admin",
        isSuperAdmin: () => get().user?.role === "super-admin",

        updateUser: async (updatedData) => {
          const user = get().user;
          if (!user) return;

          const res = await fetchWithAuth(`${API_URL}/api/users/${user.id}`, {
            method: "PATCH",
            body: JSON.stringify(updatedData),
          });

          if (!res.ok) throw new Error("Failed to update profile");
          set({ user: { ...user, ...updatedData } });
        },

        fetchAllUsers: async () => {
          const res = await fetchWithAuth(`${API_URL}/api/admin/users`);
          if (!res.ok) throw new Error("Failed to fetch users");

          const data = await safeJson(res);
          if (!data?.success) throw new Error(data?.message);

          set({
            allUsers: (data.data ?? []).map((u: any) => ({
              id: u._id,
              name: u.name,
              email: u.email ?? "",
              phone: u.phone ?? "",
              role: u.role,
              createdAt: u.createdAt,
            })),
          });
        },

        updateUserRole: async (userId, role) => {
          const res = await fetchWithAuth(`${API_URL}/api/admin/users/${userId}/role`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
          });

          if (!res.ok) throw new Error("Failed to update role");

          set((state) => ({
            allUsers: state.allUsers.map((u) => (u.id === userId ? { ...u, role } : u)),
          }));
        },

        fetchWithAuth,
      };
    },
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
