import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/DashboardShell";

const NAV = [
  { href: "/candidato/vagas", label: "Vagas disponíveis" },
  { href: "/candidato/candidaturas", label: "Minhas candidaturas" },
  { href: "/candidato/perfil", label: "Meu perfil" },
];

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || profile?.email || "Candidato";

  return (
    <DashboardShell navItems={NAV} userName={name} userInitial={name[0]?.toUpperCase() ?? "?"}>
      {children}
    </DashboardShell>
  );
}
