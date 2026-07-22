import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { BarList, Card, EmptyNote, SectionTitle } from "@/components/ui";
import { initialColor } from "@/lib/ui/avatar-color";

export default async function AdminMetricasPage() {
  const supabase = await createClient();

  const [
    { count: vagasAbertas },
    { count: candidaturas },
    { count: vagasPreenchidas },
    { data: companiesData },
    { data: openJobsData },
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "aberta"),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "preenchida"),
    supabase.from("companies").select("id, name, sector, status, created_at"),
    supabase.from("jobs").select("company_id").eq("status", "aberta"),
  ]);

  const empresas = companiesData ?? [];
  const totalEmpresas = empresas.length;
  const ativas = empresas.filter((c) => c.status === "ativa").length;
  const pendentes = empresas.filter((c) => c.status === "pendente").length;
  const inativas = empresas.filter((c) => c.status === "inativa").length;

  const inicioDoMes = new Date();
  inicioDoMes.setDate(1);
  inicioDoMes.setHours(0, 0, 0, 0);
  const novasEsteMes = empresas.filter((c) => new Date(c.created_at) >= inicioDoMes).length;

  const vagasAbertasPorEmpresa = new Map<string, number>();
  for (const job of openJobsData ?? []) {
    vagasAbertasPorEmpresa.set(job.company_id, (vagasAbertasPorEmpresa.get(job.company_id) ?? 0) + 1);
  }

  const mediaVagasPorEmpresaAtiva =
    ativas > 0 ? Math.round(((vagasAbertas ?? 0) / ativas) * 10) / 10 : 0;

  const setoresCount = new Map<string, number>();
  for (const c of empresas) {
    const setor = c.sector?.trim() || "Não informado";
    setoresCount.set(setor, (setoresCount.get(setor) ?? 0) + 1);
  }
  const topSetores = [...setoresCount.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const statusList = [
    { label: "Ativas", value: ativas },
    { label: "Pendentes de aprovação", value: pendentes },
    { label: "Inativas", value: inativas },
  ];

  const rankingEmpresas = empresas
    .map((c) => ({ ...c, vagas: vagasAbertasPorEmpresa.get(c.id) ?? 0 }))
    .sort((a, b) => b.vagas - a.vagas)
    .slice(0, 5);

  const impactoItems = [
    { label: "Vagas abertas", value: vagasAbertas ?? 0 },
    { label: "Candidaturas", value: candidaturas ?? 0 },
    { label: "Vagas preenchidas", value: vagasPreenchidas ?? 0 },
  ];

  const empresaItems = [
    { label: "Empresas cadastradas", value: totalEmpresas },
    { label: "Empresas ativas", value: ativas },
    { label: "Aguardando aprovação", value: pendentes },
    { label: "Novas empresas no mês", value: novasEsteMes },
  ];

  return (
    <div>
      <PageHeader title="Métricas de impacto" sub="Visão geral do Hub Multiplique." />

      <SectionTitle>Impacto geral</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {impactoItems.map((item) => (
          <Card key={item.label} hover>
            <div className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-hub-muted-2">
              {item.label}
            </div>
            <div className="text-4xl font-extrabold">{item.value}</div>
          </Card>
        ))}
      </div>

      <SectionTitle>Empresas parceiras</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {empresaItems.map((item) => (
          <Card key={item.label} hover>
            <div className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-hub-muted-2">
              {item.label}
            </div>
            <div className="text-4xl font-extrabold">{item.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 text-[13px] font-extrabold uppercase tracking-wide text-hub-muted-2">
            Empresas por status
          </div>
          {totalEmpresas > 0 ? (
            <BarList items={statusList} />
          ) : (
            <EmptyNote>Nenhuma empresa cadastrada ainda.</EmptyNote>
          )}
        </Card>
        <Card>
          <div className="mb-4 text-[13px] font-extrabold uppercase tracking-wide text-hub-muted-2">
            Empresas por setor
          </div>
          {topSetores.length > 0 ? (
            <BarList items={topSetores} />
          ) : (
            <EmptyNote>Nenhuma empresa cadastrada ainda.</EmptyNote>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[13px] font-extrabold uppercase tracking-wide text-hub-muted-2">
            Empresas com mais vagas abertas
          </div>
          <div className="text-[12.5px] font-semibold text-hub-muted-2">
            Média de {mediaVagasPorEmpresaAtiva} vaga(s) aberta(s) por empresa ativa
          </div>
        </div>
        {rankingEmpresas.length > 0 ? (
          <div className="space-y-2.5">
            {rankingEmpresas.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-hub-line p-3"
              >
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[9px] text-[13px] font-extrabold text-white"
                  style={{ background: initialColor(c.name) }}
                >
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold">{c.name}</div>
                  <div className="text-xs text-hub-muted-2">{c.sector || "Setor não informado"}</div>
                </div>
                <div className="flex-none text-right">
                  <div className="text-lg font-extrabold">{c.vagas}</div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wide text-hub-muted-2">
                    vaga(s) aberta(s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>Nenhuma empresa cadastrada ainda.</EmptyNote>
        )}
      </Card>
    </div>
  );
}
