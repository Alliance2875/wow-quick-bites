import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentGrant } from "@/data/types";
import type { Permission, Role } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string | null;
  clientCode?: string | null;
  permissions: Permission[];
  contentGrant?: ContentGrant | null;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb_token", accessToken);
          localStorage.setItem("wqb_refresh", refreshToken);
          localStorage.setItem("wqb_user", JSON.stringify(user));
          document.cookie = `wqb_access_token=${accessToken}; path=/; max-age=28800; SameSite=Lax`;
        } catch {
          // ignore storage error
        }
      }
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb_token", action.payload);
          document.cookie = `wqb_access_token=${action.payload}; path=/; max-age=28800; SameSite=Lax`;
        } catch {
          // ignore
        }
      }
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb_user", JSON.stringify(action.payload));
        } catch {
          // ignore
        }
      }
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{
        user?: AuthUser | null;
        accessToken?: string | null;
        refreshToken?: string | null;
      }>,
    ) => {
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.accessToken) state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = Boolean(state.accessToken && state.user);
    },
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("wqb_token");
          localStorage.removeItem("wqb_refresh");
          localStorage.removeItem("wqb_user");
          document.cookie = "wqb_access_token=; path=/; max-age=0; SameSite=Lax";
        } catch {
          // ignore
        }
      }
    },
  },
});

export const { setCredentials, setAccessToken, setUser, hydrateAuth, logOut } = authSlice.actions;
export default authSlice.reducer;
