import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { UserRole } from "@/types/database";

/** Busca o usuário autenticado; redireciona para /login se não houver sessão. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Defesa em profundidade para Server Actions sensíveis: além da RLS no
 * banco, confirma explicitamente o papel do usuário antes de prosseguir.
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
