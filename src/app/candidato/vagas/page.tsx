import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyNote } from "@/components/ui";
import { Pagination } from "@/components/Pagination";
import { initialColor } from "@/lib/ui/avatar-color";

const PAGE_SIZE = 20;

export default async function VagasCandidatoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Paginação no banco (.range()) em vez de carregar todas as vagas
  // abertas de uma vez — evita que o payload e a query cresçam sem limite
  // conforme mais empresas publicam vagas (ver auditoria de código, item #11).
  const { data: jobs, count } = await supabase
    .from("jobs")
    .select("id, title, modality, seniority, status, companies(name, city)", { count: "exact" })
    .eq("status", "aberta")
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

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

      <Pagination basePath="/candidato/vagas" params={{}} page={page} totalPages={totalPages} />
    </div>
  );
}
