"use server";

import { createClient } from "@/lib/supabase/server";

export interface SignupState {
  error?: string;
  done?: boolean;
  needsEmailConfirm?: boolean;
  redirectTo?: string;
}

export async function signUpCandidatoAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const inviteCode = String(formData.get("inviteCode") || "").trim().toUpperCase();

  if (!fullName || !email || !password || !inviteCode) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();

  const { data: redeemed, error: redeemError } = await supabase.rpc(
    "redeem_invite_code",
    { p_code: inviteCode }
  );

  if (redeemError || !redeemed) {
    return { error: "Código de convite inválido, expirado ou já usado no limite." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "candidato", full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return { needsEmailConfirm: true, done: true };
  }

  return { done: true, redirectTo: "/candidato/vagas" };
}
