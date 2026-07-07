"use server";

import { createClient } from "@/lib/supabase/server";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/empresas",
  empresa: "/empresa/vagas",
  candidato: "/candidato/vagas",
};

export interface LoginState {
  error?: string;
  redirectTo?: string;
}

export async function signInAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "E-mail ou senha inválidos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  return { redirectTo: ROLE_HOME[profile?.role ?? "candidato"] };
}
