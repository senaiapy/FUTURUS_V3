export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
  refresh_token?: string;
};

export type TokenType = {
  access: string;
  refresh?: string;
};
