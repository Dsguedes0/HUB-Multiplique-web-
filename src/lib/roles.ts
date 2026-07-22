import type { UserRole } from "@/types/database";

/**
 * Rota inicial de cada papel de usuário. Fonte única de verdade — antes
 * duplicada em src/lib/supabase/middleware.ts, src/app/login/actions.ts e
 * src/app/page.tsx (ver auditoria de código, item #16).
 */
export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/empresas",
  empresa: "/empresa/vagas",
  candidato: "/candidato/vagas",
};

export function roleHome(role: string | null | undefined): string {
  return ROLE_HOME[(role as UserRole) ?? "candidato"] ?? "/login";
}
