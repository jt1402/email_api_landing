import { billing } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { PlaygroundClient } from "./PlaygroundClient";

export default async function PlaygroundPage() {
  const token = (await getSession()) as string;
  const balance = await billing.balance(token);
  return <PlaygroundClient initialBalance={balance.credit_balance_checks} />;
}
