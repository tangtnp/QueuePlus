export type UserRole = "user" | "staff" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}