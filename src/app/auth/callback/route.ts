import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Rota chamada pelo link que o Supabase envia por e-mail (reset de senha,
// magic link, confirmação de cadastro). Troca o "code" de um só uso pela
// sessão do usuário e manda ele pra frente — no caso de reset de senha,
// para /reset-password, onde a nova senha é definida.
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
