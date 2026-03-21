import { apiPost } from './client';
import { setToken, setUser, removeToken, removeUser } from './client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
    isTwoFactorEnabled: boolean;
  };
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  email: string;
}

export async function login(credentials: LoginDto) {
  const response = await apiPost<AuthResponse | MfaRequiredResponse>(
    '/auth/login',
    credentials,
  );

  if (response.data && 'access_token' in response.data) {
    setToken(response.data.access_token);
    setUser(response.data.user);
  }

  return response;
}

export async function loginWithTwoFactor(email: string, code: string) {
  const response = await apiPost<AuthResponse>('/auth/2fa/login', {
    email,
    code,
  });

  if (response.data) {
    setToken(response.data.access_token);
    setUser(response.data.user);
  }

  return response;
}

export async function generateTwoFactor() {
  return await apiPost<{ secret: string; qrCodeDataUrl: string }>(
    '/auth/2fa/generate',
    {},
  );
}

export async function enableTwoFactor(token: string, secret: string) {
  return await apiPost<{ message: string }>('/auth/2fa/enable', {
    code: token,
    secret,
  });
}

export async function register(data: RegisterDto) {
  const response = await apiPost<AuthResponse>('/auth/register', data);

  if (response.data) {
    setToken(response.data.access_token);
    setUser(response.data.user);
  }

  return response;
}

export function logout() {
  removeToken();
  removeUser();
}
