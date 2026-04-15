import type { TokenType } from './utils';

import { create } from 'zustand';
import { createSelectors } from '../utils';
import { getToken, removeToken, setToken } from './utils';

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  balance?: number;
  balanceBonus?: number;
  balanceWin?: number;
  balanceTotal?: number;
  fiatBalance?: number;
  avatarUrl?: string;
  phone?: string;
  walletAddress?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthState = {
  token: TokenType | null;
  status: 'idle' | 'signOut' | 'signIn';
  user: User | null;
  signIn: (data: { token: TokenType; user?: User }) => void;
  signOut: () => void;
  hydrate: () => void;
  setUser: (user: User) => void;
};

const _useAuth = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: (data) => {
    setToken(data.token);
    set({ status: 'signIn', token: data.token, user: data.user || null });
  },
  signOut: () => {
    removeToken();
    set({ status: 'signOut', token: null, user: null });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      if (userToken !== null) {
        get().signIn({ token: userToken });
      }
      else {
        get().signOut();
      }
    }
    catch (e) {
      console.error(e);
      // catch error here
      // Maybe sign_out user!
    }
  },
  setUser: user => set({ user }),
}));

export const useAuth = createSelectors(_useAuth);

export const signOut = () => _useAuth.getState().signOut();
export function signIn(data: { token: TokenType; user?: User }) {
  return _useAuth.getState().signIn(data);
}
export const hydrateAuth = () => _useAuth.getState().hydrate();
