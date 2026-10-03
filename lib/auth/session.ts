import { cookies } from "next/headers";

import type { AuthenticatedUser, SessionPayload } from "@/types/auth";
import { getClearedSessionCookieOptions, getSessionCookieOptions } from "./session-cookie";
import { createSessionToken, verifySessionToken } from "./session-token";

export const SESSION_COOKIE_NAME = "eauction_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const REMEMBERED_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(user: AuthenticatedUser, remember: boolean) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET must be configured before users can sign in.");
  }

  const duration = remember
    ? REMEMBERED_SESSION_DURATION_SECONDS
    : SESSION_DURATION_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + duration;
  const token = await createSessionToken(user, secret, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions(duration, process.env.NODE_ENV === "production"),
  );
}

export async function getSession(): Promise<SessionPayload | null> {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token, secret);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    "",
    getClearedSessionCookieOptions(process.env.NODE_ENV === "production"),
  );
}
