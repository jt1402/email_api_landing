import { redirect } from "next/navigation";
import { auth, BackendCallError } from "@/lib/backend";
import { getSession, clearSession } from "@/lib/session";
import { SignupForm } from "./SignupForm";

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8001";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ oauth_error?: string }>;
}) {
  const token = await getSession();
  let signedIn = false;
  if (token) {
    try {
      await auth.me(token);
      signedIn = true;
    } catch (err) {
      if (err instanceof BackendCallError && err.status === 401) {
        await clearSession();
      } else {
        throw err;
      }
    }
  }
  if (signedIn) redirect("/dashboard");
  const { oauth_error } = await searchParams;
  return (
    <SignupForm
      googleAuthUrl={`${BACKEND}/v1/auth/oauth/google/start`}
      githubAuthUrl={`${BACKEND}/v1/auth/oauth/github/start`}
      oauthError={oauth_error}
    />
  );
}
