export function getSessionCookieOptions(duration: number, secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: duration,
  };
}

export function getClearedSessionCookieOptions(secure: boolean) {
  return {
    ...getSessionCookieOptions(0, secure),
    expires: new Date(0),
  };
}
