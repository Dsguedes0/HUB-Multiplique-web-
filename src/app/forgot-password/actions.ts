"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface ForgotPasswordState {
  error?: string;
  sent?: boolean;
}

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Sempre retornamos sucesso, mesmo se o e-mail não existir na base —
  // evita que alguém use este formulário para descobrir quais e-mails têm conta.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { sent: true };
}
