"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { passwordError } from "@/lib/auth/password-policy";
import type { SignupState } from "../candidato/actions";

export async function signUpEmpresaAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const responsavel = String(formData.get("responsavel") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const nome = String(formData.get("nome") || "").trim();
  const cidade = String(formData.get("cidade") || "").trim();
  const setor = String(formData.get("setor") || "").trim();

  if (!responsavel || !email || !password || !nome) {
    return { error: "Preencha ao menos nome do responsável, e-mail, senha e nome da empresa." };
  }
  const pwError = passwordError(password);
  if (pwError) return { error: pwError };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "empresa", full_name: responsavel } },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Não foi possível criar a conta." };

  const admin = createAdminClient();
  const { error: companyError } = await admin.from("companies").insert({
    owner_id: data.user.id,
    name: nome,
    city: cidade || null,
    sector: setor || null,
    status: "pendente",
  });

  if (companyError) {
    // 23505 = unique_violation na constraint companies_owner_id_key — já
    // existe empresa para esse usuário (reenvio do form após falha parcial).
    if (companyError.code === "23505") {
      return {
        error:
          "Já existe uma empresa cadastrada para esse e-mail. Tente fazer login em vez de cadastrar de novo.",
      };
    }
    return { error: companyError.message };
  }

  if (!data.session) {
    return { needsEmailConfirm: true, done: true };
  }

  return { done: true, redirectTo: "/empresa/vagas" };
}
