/**
 * Session cookie helpers.
 *
 * We store the opaque FastAPI session token in an httpOnly cookie on the
 * Next origin. The Next server is the only thing that reads it — when it
 * calls the backend it forwards it as `Authorization: Bearer <token>`.
 *
 * Cookie is set by Server Actions / Route Handlers only (Next rule).
 */

import { cookies } from "next/headers";

export const SESSION_COOKIE = "vm_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getSession(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
