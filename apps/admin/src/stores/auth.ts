import { create } from 'zustand';
import type { User } from '@reactpress/types';
import { apiGet, apiPost, setAccessToken } from '../lib/api.js';

const TOKEN_STORAGE_KEY = 'reactpress.accessToken';

type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  clearSession: () => void;
}

function readStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* penyimpanan tidak tersedia — token tetap hidup di memori */
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'unknown',

  clearSession: () => {
    setAccessToken(null);
    writeStoredToken(null);
    set({ user: null, status: 'anonymous' });
  },

  login: async (email, password) => {
    const result = await apiPost<{ accessToken: string; user: User }>(
      '/auth/login',
      { email, password },
      { skipRefresh: true },
    );
    setAccessToken(result.accessToken);
    writeStoredToken(result.accessToken);
    set({ user: result.user, status: 'authenticated' });
  },

  logout: async () => {
    try {
      await apiPost('/auth/logout', undefined, { skipRefresh: true });
    } catch {
      /* token mungkin sudah kadaluarsa — sesi lokal tetap dibersihkan */
    }
    setAccessToken(null);
    writeStoredToken(null);
    set({ user: null, status: 'anonymous' });
  },

  bootstrap: async () => {
    const stored = readStoredToken();
    if (stored) setAccessToken(stored);
    try {
      const user = await apiGet<User>('/auth/me');
      set({ user, status: 'authenticated' });
    } catch {
      setAccessToken(null);
      writeStoredToken(null);
      set({ user: null, status: 'anonymous' });
    }
  },
}));

export function currentUser(): User | null {
  return useAuthStore.getState().user;
}
