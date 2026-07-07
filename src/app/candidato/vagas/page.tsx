import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyNote } from "@/components/ui";

function initialColor(name: string) {
  const colors = ["#e8432e", "#2f9e5b", "#3d6fb4", "#b4573d", "#7a5cc9"];
  let h = 0;
  for (const c of name) h += c.charCodeAt(0);
  return colors[h % colors.length];
}

export default async function VagasCandidatoPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, modality, seniority, status, companies(name, city)")
    .eq("status", "aberta")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Vagas disponíveis"
        sub="Vagas abertas pelas empresas parceiras do Hub Multiplique — visíveis só para a comunidade."
      />

      {!jobs || jobs.length === 0 ? (
        <EmptyNote>Nenhuma vaga aberta no momento. Volte em breve!</EmptyNote>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => {
            const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
            return (
              <Link
                key={job.id}
                href={`/candidato/vagas/${job.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hub-line bg-white p-4 transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-hub-red hover:shadow-[0_16px_36px_rgba(0,0,0,.12)] sm:p-4.5"
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                  <div
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] text-[15px] font-extrabold text-white"
                    style={{ background: initialColor(company?.name ?? "?") }}
                  >
                    {company?.name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-extrabold">{job.title}</div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-hub-muted-2">
                      <span>{company?.name}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{job.modality}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{job.seniority}</span>
                      {company?.city && (
                        <>
                          <span className="hidden sm:inline">·</span>
                          <span>{company.city}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="ml-auto whitespace-nowrap rounded-full border border-[#f4c6ba] bg-[#fce8e3] px-2.5 py-1 text-[11.5px] font-bold text-hub-red-dark sm:ml-0">
                  Ver vaga →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
