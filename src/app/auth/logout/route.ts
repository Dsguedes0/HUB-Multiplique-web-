import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which made the browser re-POST to /login and get a 405 there.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
