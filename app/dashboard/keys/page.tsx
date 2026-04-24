import { billing, keys } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { KeysClient } from "./KeysClient";

export default async function KeysPage() {
  const token = (await getSession()) as string;
  const [rows, balance] = await Promise.all([
    keys.list(token),
    billing.balance(token),
  ]);
  return (
    <KeysClient initialKeys={rows} hasPurchased={balance.has_purchased} />
  );
}
