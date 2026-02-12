import type { TokenPayload } from "./types";

const TOKEN_TTL_MS = 60 * 60 * 1000;
export const AUTH_TOKEN_STORAGE_KEY = "cm.auth.token";

function encodePayload(payload: TokenPayload): string {
  return btoa(JSON.stringify(payload));
}

function decodePayload(token: string): TokenPayload {
  const rawPayload = atob(token);
  return JSON.parse(rawPayload) as TokenPayload;
}

export function generateFakeToken(payload: Omit<TokenPayload, "exp">): string {
  const tokenPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  return encodePayload(tokenPayload);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return decodePayload(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: TokenPayload): boolean {
  return payload.exp <= Date.now();
}

export function saveToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
