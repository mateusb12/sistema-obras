import type { MockUser } from "./types";
import { ROLES } from "./types";

export const MOCK_USERS: MockUser[] = [
  {
    id: "u-1",
    name: "Ana Admin",
    email: "ana.admin@casasmanager.com",
    password: "admin123",
    role: ROLES.ADMIN,
  },
  {
    id: "u-2",
    name: "Eduardo Engineer",
    email: "edu.engineer@casasmanager.com",
    password: "engineer123",
    role: ROLES.ENGINEER,
  },
  {
    id: "u-3",
    name: "Vera Viewer",
    email: "vera.viewer@casasmanager.com",
    password: "viewer123",
    role: ROLES.VIEWER,
  },
];
