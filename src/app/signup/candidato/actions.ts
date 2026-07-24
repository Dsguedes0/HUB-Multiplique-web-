"use server";

import { createClient } from "@/lib/supabase/server";
import { passwordError } from "@/lib/auth/password-policy";

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
  const pwError = passwordError(password);
  if (pwError) return { error: pwError };

  const supabase = await createClient();

  // Só checa validade aqui, sem consumir — o convite é gasto depois que o
  // signUp tiver sucesso, para não queimar um uso em falhas de cadastro.
  const { data: valid, error: checkError } = await supabase.rpc(
    "check_invite_code",
    { p_code: inviteCode }
  );

  if (checkError || !valid) {
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

  const { data: redeemed, error: redeemError } = await supabase.rpc(
    "redeem_invite_code",
    { p_code: inviteCode }
  );

  if (redeemError || !redeemed) {
    // Corrida rara entre checagem e consumo (dois cadastros simultâneos no
    // último uso do código). A conta já foi criada e não dá pra desfazer o
    // signUp aqui, então só sinalizamos.
    return {
      error:
        "Conta criada, mas o código de convite não pôde ser confirmado (pode ter sido usado por outra pessoa ao mesmo tempo). Entre em contato com o Hub Multiplique.",
    };
  }

  if (!data.session) {
    return { needsEmailConfirm: true, done: true };
  }

  return { done: true, redirectTo: "/candidato/vagas" };
}
