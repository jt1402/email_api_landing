import { redirect } from "next/navigation";
import { auth, BackendCallError } from "@/lib/backend";
import { getSession, clearSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
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
  return <LoginForm />;
}
