import assert from "node:assert/strict";
import test from "node:test";

import { roleHasPermission } from "../../lib/permissions.ts";
import {
  canAccessPortal,
  getPortalHome,
} from "../../lib/auth/portal-policy.ts";
import {
  createSessionToken,
  verifySessionToken,
} from "../../lib/auth/session-token.ts";
import {
  getClearedSessionCookieOptions,
  getSessionCookieOptions,
} from "../../lib/auth/session-cookie.ts";
import { toSessionPayload } from "../../lib/auth/session-validation.ts";

const secret = new TextEncoder().encode("test-only-session-secret-with-more-than-32-characters");
const user = {
  id: "user-test-id",
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN" as const,
};

test("each role resolves to its assigned portal", () => {
  assert.equal(getPortalHome("SUPER_ADMIN"), "/admin");
  assert.equal(getPortalHome("ADMIN"), "/admin");
  assert.equal(getPortalHome("CLIENT"), "/client");
  assert.equal(getPortalHome("VENDOR"), "/vendor");
  assert.equal(getPortalHome("SUPPORT"), "/support");
});

test("portal access requires both an allowed role and the required permission", () => {
  assert.equal(canAccessPortal("ADMIN", "admin"), true);
  assert.equal(canAccessPortal("SUPER_ADMIN", "admin"), true);
  assert.equal(canAccessPortal("CLIENT", "admin"), false);
  assert.equal(canAccessPortal("VENDOR", "client"), false);
  assert.equal(canAccessPortal("SUPPORT", "support"), true);
});

test("permission helpers preserve role boundaries", () => {
  assert.equal(roleHasPermission("CLIENT", "AUCTIONS:CREATE"), true);
  assert.equal(roleHasPermission("VENDOR", "AUCTIONS:CREATE"), false);
  assert.equal(roleHasPermission("VENDOR", "AUCTIONS:PARTICIPATE"), true);
});

test("valid signed sessions are accepted and tampered sessions are rejected", async () => {
  const token = await createSessionToken(
    user,
    secret,
    Math.floor(Date.now() / 1000) + 60,
  );

  const session = await verifySessionToken(token, secret);
  assert.equal(session?.id, user.id);
  assert.equal(session?.role, "ADMIN");

  const [header, payload, signature] = token.split(".");
  const tamperedSignature = `${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}`;
  const tamperedToken = `${header}.${payload}.${tamperedSignature}`;
  assert.equal(await verifySessionToken(tamperedToken, secret), null);
});

test("expired and structurally invalid sessions are rejected", async () => {
  const expiredToken = await createSessionToken(
    user,
    secret,
    Math.floor(Date.now() / 1000) - 60,
  );

  assert.equal(await verifySessionToken(expiredToken, secret), null);
  assert.equal(toSessionPayload({ id: "missing-required-fields" }), null);
});

test("session cookie settings enforce HTTP-only protection and reliable clearing", () => {
  assert.deepEqual(getSessionCookieOptions(60, true), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60,
  });

  const cleared = getClearedSessionCookieOptions(true);
  assert.equal(cleared.httpOnly, true);
  assert.equal(cleared.secure, true);
  assert.equal(cleared.maxAge, 0);
  assert.equal(cleared.expires.getTime(), 0);
});
