import { keys } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { KeysClient } from "./KeysClient";

export default async function KeysPage() {
  const token = (await getSession()) as string;
  const rows = await keys.list(token);
  return <KeysClient initialKeys={rows} />;
}
