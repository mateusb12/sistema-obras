export const ROLES = {
  ADMIN: "admin",
  ENGINEER: "engineer",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type AuthUser = Omit<MockUser, "password">;

export type TokenPayload = {
  userId: string;
  role: Role;
  name: string;
  exp: number;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  isAuthenticated: boolean;
};
