import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 força GET no redirect; o 307 padrão preservava o POST e causava 405 em /login.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
