import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { Card } from "@/components/ui";

export default async function AdminMetricasPage() {
  const supabase = await createClient();

  const [{ count: vagasAbertas }, { count: candidaturas }, { count: vagasPreenchidas }] =
    await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "aberta"),
      supabase.from("applications").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "preenchida"),
    ]);

  const items = [
    { label: "Vagas abertas", value: vagasAbertas ?? 0 },
    { label: "Candidaturas", value: candidaturas ?? 0 },
    { label: "Vagas preenchidas", value: vagasPreenchidas ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="Métricas de impacto" sub="Visão geral do Hub Multiplique." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label} hover>
            <div className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-hub-muted-2">
              {item.label}
            </div>
            <div className="text-4xl font-extrabold">{item.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
