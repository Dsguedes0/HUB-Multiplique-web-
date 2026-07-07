"use server";

import { createClient } from "@/lib/supabase/server";

export interface ResetPasswordState {
  error?: string;
  done?: boolean;
}

export async function updatePasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8) {
    return { error: "A senha precisa ter no mínimo 8 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();

  // Só chega aqui com sessão válida se veio do link de recuperação
  // (trocado em /auth/callback) ou se já estava logado.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Sua sessão de redefinição expirou. Solicite um novo link em 'Esqueci minha senha'.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
  }

  // Por segurança, encerra as outras sessões ativas com a senha antiga.
  await supabase.auth.signOut({ scope: "others" });

  return { done: true };
}
