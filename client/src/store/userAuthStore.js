import { create } from "zustand";
import api from "../lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  loading: false,
  sendingotp: false,
  twoFactorEnabled: false,
  pendingEmail: null,
  error: String || null,
  // Sign up handler
  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", formData);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Registration failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  //   Sign in handler
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", credentials);
      if (res.data.twoFactorEnabled) {
        set({ twoFactorEnabled: true, pendingEmail: credentials.email });
      } else {
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          twoFactorEnabled: false,
          pendingEmail: null,
        });
      }
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  verify2FA: async (otp) => {
    set({ loading: true, error: null });
    try {
      const email = get().pendingEmail;
      if (!email) throw new Error("No email stored for 2FA verification");
      const res = await api.post("/auth/verify-2fa", { email, otp });
      set({
        user: res.data.user,
        accessToken: res.data.accessToken,
        twoFactorEnabled: false,
        pendingEmail: null,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Invalid 2FA code" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  //   Refresh the access token after 15 minutes handler:
  refreshAccessToken: async () => {
    set({ error: null });
    try {
      const res = await api.post("/auth/refresh");
      set({ accessToken: res.data.accessToken });

      const userRes = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      set({ user: userRes.data });
      return res.data.accessToken;
    } catch (err) {
      set({ error: "Session expired, please log in again" });
      throw err;
    }
  },
  resendOTP: async () => {
    set({ error: null, sendingotp: true });
    try {
      const email = get().pendingEmail;
      if (!email) throw new Error("No email found for resending 2FA code");
      await api.post("/auth/resend-2fa", { email });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to resend 2FA code",
      });
      throw err;
    } finally {
      set({ sendingotp: false });
    }
  },
  //   Logout handler:
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout failed silently", err);
    } finally {
      set({ user: null, accessToken: null, twoFactorEnabled: false });
    }
  },
  //  Setting
  initAuth: async () => {
    try {
      await api.get().refreshAccessToken();
    } catch {
      set({ user: null, accessToken: null, error: null });
    }
  },
}));
