import { type NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

const SAFE_NEXT = /^\/[A-Za-z0-9_\-./?=&%]*$/;

export async function GET(req: NextRequest) {
  await clearSession();
  const raw = req.nextUrl.searchParams.get("next") ?? "/";
  const next = SAFE_NEXT.test(raw) ? raw : "/";
  return NextResponse.redirect(new URL(next, req.url));
}
