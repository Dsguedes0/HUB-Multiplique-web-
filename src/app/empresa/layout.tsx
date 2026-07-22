import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/DashboardShell";

const NAV = [
  { href: "/empresa/perfil", label: "Dados da empresa" },
  { href: "/empresa/vagas", label: "Minhas vagas" },
  { href: "/empresa/empresas", label: "Empresas" },
];

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("owner_id", user.id)
    .single();

  const name = company?.name || "Empresa";

  return (
    <DashboardShell navItems={NAV} userName={name} userInitial={name[0]?.toUpperCase() ?? "?"}>
      {children}
    </DashboardShell>
  );
}
