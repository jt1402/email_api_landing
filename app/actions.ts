"use server";

/**
 * Server Actions — signup, login, verify (magic-link callback), logout,
 * and dashboard mutations (create/revoke API key).
 *
 * All actions return plain JSON so client components can render errors.
 * State-mutating actions call `revalidatePath` to refresh server-rendered
 * data on return.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, keys, BackendCallError } from "@/lib/backend";
import { clearSession, getSession, setSession } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

function errMessage(err: unknown, fallback: string): string {
  if (err instanceof BackendCallError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function signupAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Email is required." };
  try {
    await auth.signup(email);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errMessage(err, "Could not start signup.") };
  }
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Email is required." };
  try {
    await auth.login(email);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errMessage(err, "Could not send the link.") };
  }
}

/**
 * Consumed by the /auth/verify page. Returns success/failure so the page
 * can show inline errors for expired links; redirects to /dashboard on
 * success (from the client after await).
 */
export async function verifyTokenAction(token: string): Promise<ActionResult> {
  if (!token) return { ok: false, error: "Missing token." };
  try {
    const result = await auth.verify(token);
    await setSession(result.session_token);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: errMessage(err, "Link is invalid or expired."),
    };
  }
}

export async function logoutAction(): Promise<void> {
  const token = await getSession();
  if (token) {
    try {
      await auth.logout(token);
    } catch {
      /* always clear local cookie regardless of backend outcome */
    }
  }
  await clearSession();
  redirect("/login");
}

export async function createKeyAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token = await getSession();
  if (!token) return { ok: false, error: "Not signed in." };
  const name = String(formData.get("name") ?? "").trim() || "Untitled key";
  try {
    await keys.create(token, name);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/keys");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errMessage(err, "Could not create key.") };
  }
}

export async function revokeKeyAction(formData: FormData): Promise<void> {
  const token = await getSession();
  if (!token) redirect("/login");
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) {
    try {
      await keys.revoke(token!, id);
    } catch {
      /* ignore — 404 means already gone; nothing to do here */
    }
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/keys");
}
