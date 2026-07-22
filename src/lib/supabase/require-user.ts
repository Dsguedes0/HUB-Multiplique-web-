import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { UserRole } from "@/types/database";

/**
 * Busca o usuário autenticado e redireciona para /login se não houver
 * sessão. Substitui o padrão `user!.id` espalhado pelas páginas, que
 * dependia implicitamente do layout pai já ter redirecionado antes da
 * página renderizar (ver auditoria de código, item #18).
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Camada de defesa em profundidade para Server Actions sensíveis: além da
 * política de RLS no banco, a própria action confirma explicitamente o
 * papel do usuário antes de prosseguir (ver auditoria de código, item #7).
 * Lança um erro amigável em vez de deixar a operação falhar silenciosamente
 * só pela RLS.
 */
export async function requireRole(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== role) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }

  return { supabase, user };
}
