import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { Card, EmptyNote, Tag } from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  candidatou: "Em análise",
  visualizado: "Visualizado pela empresa",
  entrevista: "Entrevista",
  rejeitado: "Não seguiu",
  contratado: "Contratado(a)",
};

const STATUS_TONE: Record<string, "amber" | "green" | "red" | "neutral"> = {
  candidatou: "amber",
  visualizado: "amber",
  entrevista: "green",
  rejeitado: "red",
  contratado: "green",
};

export default async function CandidaturasPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, match_score, status, jobs(id, title, companies(name))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Minhas candidaturas"
        sub="Acompanhe o status e sua régua de match em cada vaga."
      />

      <Card className="overflow-x-auto">
        {!applications || applications.length === 0 ? (
          <EmptyNote>Você ainda não se candidatou a nenhuma vaga.</EmptyNote>
        ) : (
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-hub-line text-left text-[11px] uppercase tracking-wide text-hub-muted-2">
                <th className="px-2.5 py-2">Vaga</th>
                <th className="px-2.5 py-2">Empresa</th>
                <th className="px-2.5 py-2">Status</th>
                <th className="px-2.5 py-2">Match</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const job = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
                const company = job?.companies
                  ? Array.isArray(job.companies)
                    ? job.companies[0]
                    : job.companies
                  : null;
                return (
                  <tr key={a.id} className="border-b border-hub-line transition-colors duration-200 last:border-none hover:bg-hub-paper">
                    <td className="px-2.5 py-2.5">
                      <Link href={`/candidato/vagas/${job?.id}`} className="font-bold hover:text-hub-red">
                        {job?.title}
                      </Link>
                    </td>
                    <td className="px-2.5 py-2.5">{company?.name}</td>
                    <td className="px-2.5 py-2.5">
                      <Tag tone={STATUS_TONE[a.status] ?? "neutral"}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </Tag>
                    </td>
                    <td className="px-2.5 py-2.5">{a.match_score}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
