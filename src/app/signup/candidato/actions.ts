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

  // Só verifica a validade do convite aqui (sem consumir um uso). O convite
  // só é efetivamente gasto depois que o cadastro tiver sucesso — antes,
  // qualquer falha no signUp (e-mail duplicado, instabilidade da Auth, etc.)
  // já queimava um uso do convite sem nenhuma conta ter sido criada.
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
    // Caso raro de corrida entre a checagem e o consumo (ex.: dois
    // cadastros simultâneos com o último uso disponível do mesmo código).
    // A conta já foi criada nesse ponto — não há como desfazer o signUp
    // aqui, então sinalizamos e deixamos seguir; vale registrar/alertar
    // esse caso em produção.
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
