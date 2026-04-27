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
import {
  auth,
  billing,
  checks,
  keys,
  oauth,
  BackendCallError,
  type BundleId,
  type CheckResponse,
  type CreatedKey,
} from "@/lib/backend";
import { clearSession, getSession, setSession } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type VerifyActionResult =
  | { ok: true; defaultApiKey: string | null }
  | { ok: false; error: string };
export type CheckResult =
  | { ok: true; data: CheckResponse }
  | { ok: false; error: string };
export type CreateKeyResult =
  | { ok: true; created: CreatedKey }
  | { ok: false; error: string };

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
export async function verifyTokenAction(
  token: string
): Promise<VerifyActionResult> {
  if (!token) return { ok: false, error: "Missing token." };
  try {
    const result = await auth.verify(token);
    await setSession(result.session_token);
    return { ok: true, defaultApiKey: result.default_api_key };
  } catch (err) {
    return {
      ok: false,
      error: errMessage(err, "Link is invalid or expired."),
    };
  }
}

/**
 * Consumed by /auth/oauth/exchange. Swaps the one-time code the backend put
 * in the redirect URL for a session token (stored in our httpOnly cookie)
 * and the raw default API key (stashed in sessionStorage from the page).
 */
export async function oauthExchangeAction(
  code: string
): Promise<VerifyActionResult> {
  if (!code) return { ok: false, error: "Missing code." };
  try {
    const result = await oauth.exchange(code);
    await setSession(result.session_token);
    return { ok: true, defaultApiKey: result.default_api_key };
  } catch (err) {
    return {
      ok: false,
      error: errMessage(err, "Sign-in failed. Please try again."),
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
  _prev: CreateKeyResult | null,
  formData: FormData
): Promise<CreateKeyResult> {
  const token = await getSession();
  if (!token) return { ok: false, error: "Not signed in." };
  const name = String(formData.get("name") ?? "").trim() || "Untitled key";
  try {
    const created = await keys.create(token, name);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/keys");
    return { ok: true, created };
  } catch (err) {
    return { ok: false, error: errMessage(err, "Could not create key.") };
  }
}

export async function refreshDashboardAction(): Promise<void> {
  // Invalidate the whole /dashboard subtree so pages pick up fresh balance +
  // has_purchased after an async event (Stripe webhook crediting a bundle).
  revalidatePath("/dashboard", "layout");
}

export async function buyBundleAction(formData: FormData): Promise<void> {
  const token = await getSession();
  if (!token) redirect("/login");
  const bundle = String(formData.get("bundle") ?? "") as BundleId;
  if (
    bundle !== "5k" &&
    bundle !== "10k" &&
    bundle !== "25k" &&
    bundle !== "50k" &&
    bundle !== "100k"
  )
    return;
  const { url } = await billing.checkout(token!, bundle);
  redirect(url);
}

export async function runPlaygroundCheckAction(
  _prev: CheckResult | null,
  formData: FormData
): Promise<CheckResult> {
  const token = await getSession();
  if (!token) return { ok: false, error: "Not signed in." };
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter an email to check." };
  const profile = String(formData.get("risk_profile") ?? "").trim();
  try {
    const data = await checks.preview(token, {
      email,
      risk_profile: profile || undefined,
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: errMessage(err, "Could not run the check.") };
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
