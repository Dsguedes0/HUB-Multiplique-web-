import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Troca o "code" de uso único (do link de e-mail do Supabase) pela sessão do usuário.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Link inválido ou expirado. Solicite um novo.`
  );
}
