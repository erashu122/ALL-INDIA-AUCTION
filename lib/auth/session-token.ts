import { jwtVerify, SignJWT, type JWTPayload } from "jose";

import type { AuthenticatedUser, SessionPayload } from "../../types/auth.ts";
import { toSessionPayload } from "./session-validation.ts";

export { toSessionPayload } from "./session-validation.ts";

export async function createSessionToken(
  user: AuthenticatedUser,
  secret: Uint8Array,
  expiresAt: number,
): Promise<string> {
  return new SignJWT({ ...user, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
  secret: Uint8Array,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return toSessionPayload(payload as JWTPayload);
  } catch {
    return null;
  }
}
