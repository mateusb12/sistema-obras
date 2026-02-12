import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { MOCK_USERS } from "./mockUsers";
import type { AuthContextValue, AuthUser, Role } from "./types";
import { AuthContext } from "./authContextInstance";
import {
  clearStoredToken,
  decodeToken,
  generateFakeToken,
  getStoredToken,
  isTokenExpired,
  saveToken,
} from "./tokenService";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

function toAuthUser(id: string): AuthUser | null {
  const matchedUser = MOCK_USERS.find((user) => user.id === id);

  if (!matchedUser) {
    return null;
  }

  return {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
  };
}

function restoreAuthState(): AuthState {
  const storedToken = getStoredToken();

  if (!storedToken) {
    return { token: null, user: null };
  }

  const payload = decodeToken(storedToken);

  if (!payload || isTokenExpired(payload)) {
    clearStoredToken();
    return { token: null, user: null };
  }

  const restoredUser = toAuthUser(payload.userId);

  if (!restoredUser) {
    clearStoredToken();
    return { token: null, user: null };
  }

  return {
    token: storedToken,
    user: restoredUser,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [{ token, user }, setAuthState] = useState<AuthState>(restoreAuthState);

  const logout = useCallback(() => {
    clearStoredToken();
    setAuthState({ token: null, user: null });
  }, []);

  const login = useCallback((email: string, password: string) => {
    const matchedUser = MOCK_USERS.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    );

    if (!matchedUser) {
      throw new Error("Credenciais inválidas");
    }

    const authUser = toAuthUser(matchedUser.id);

    if (!authUser) {
      throw new Error("Usuário não encontrado");
    }

    const generatedToken = generateFakeToken({
      userId: authUser.id,
      role: authUser.role,
      name: authUser.name,
    });

    saveToken(generatedToken);
    setAuthState({ token: generatedToken, user: authUser });
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!user) {
        return false;
      }

      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login,
      logout,
      hasRole,
      isAuthenticated: Boolean(user && token),
    }),
    [hasRole, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
