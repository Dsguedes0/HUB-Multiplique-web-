import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { Button, EmptyNote, Tag } from "@/components/ui";

export default async function VagasEmpresaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user!.id)
    .single();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, modality, seniority, status, applications(count)")
    .eq("company_id", company?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Minhas vagas" sub={`${company?.name ?? ""} — vagas publicadas para a comunidade do Hub Multiplique.`} />

      <div className="mb-4">
        <Link href="/empresa/vagas/nova">
          <Button type="button" variant="brand">
            + Nova vaga
          </Button>
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <EmptyNote>Você ainda não publicou nenhuma vaga.</EmptyNote>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => {
            const count = Array.isArray(job.applications)
              ? job.applications[0]?.count ?? 0
              : 0;
            return (
              <Link
                key={job.id}
                href={`/empresa/vagas/${job.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hub-line bg-white p-4 transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-hub-red hover:shadow-[0_16px_36px_rgba(0,0,0,.12)] sm:p-4.5"
              >
                <div className="min-w-0">
                  <div className="text-[14.5px] font-extrabold">{job.title}</div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-hub-muted-2">
                    <span>{job.modality}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{job.seniority}</span>
                    <span className="hidden sm:inline">·</span>
                    <Tag tone={job.status === "aberta" ? "green" : "amber"}>{job.status}</Tag>
                  </div>
                </div>
                <div className="ml-auto flex flex-none items-center gap-2.5 sm:ml-0">
                  <span className="whitespace-nowrap rounded-full border border-hub-line bg-hub-paper px-3 py-1 text-xs font-bold">
                    {count} candidatos
                  </span>
                  <Tag tone="brand">Ver ranking →</Tag>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
