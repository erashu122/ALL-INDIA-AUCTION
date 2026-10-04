import type { Role } from "@/types/permissions";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationName?: string;
  mustChangePassword?: boolean;
};

export type SessionPayload = AuthenticatedUser & {
  expiresAt: number;
  issuedAt: number;
};

export type SignInFormState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};