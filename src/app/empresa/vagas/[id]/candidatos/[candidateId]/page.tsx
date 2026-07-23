import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { Card, SectionTitle, Tag, EmptyNote } from "@/components/ui";
import { Regua } from "@/components/Regua";
import { StatusSelect } from "../../StatusSelect";
import { initialColor } from "@/lib/ui/avatar-color";
import type { CandidateExperience, CandidateSkill } from "@/types/database";

export default async function CandidatoDetalhePage({
  params,
}: {
  params: Promise<{ id: string; candidateId: string }>;
}) {
  const { id, candidateId } = await params;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("id, status, match_score, match_breakdown, jobs(title)")
    .eq("job_id", id)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (!application) notFound();
  const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", candidateId)
    .maybeSingle();

  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("availability, salary_expectation, education, skills, experiences, cv_url")
    .eq("id", candidateId)
    .maybeSingle();

  const skills = (candidateProfile?.skills as CandidateSkill[]) ?? [];
  const experiences = (candidateProfile?.experiences as CandidateExperience[]) ?? [];
  const name = profile?.full_name ?? "Candidato";

  let cvSignedUrl: string | null = null;
  if (candidateProfile?.cv_url) {
    const { data: signed } = await supabase.storage
      .from("cvs")
      .createSignedUrl(candidateProfile.cv_url, 60 * 10);
    cvSignedUrl = signed?.signedUrl ?? null;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/empresa/vagas/${id}`}
          className="text-[12.5px] font-bold text-hub-muted-2 hover:text-hub-black"
        >
          ← Voltar para candidatos
        </Link>
      </div>

      <PageHeader title={name} sub={`Candidatura para: ${job?.title ?? ""}`} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-1 flex items-center gap-3.5">
            <div
              className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] text-[15px] font-extrabold text-white"
              style={{ background: initialColor(name) }}
            >
              {name[0]}
            </div>
            <div>
              <div className="text-[15px] font-extrabold">{name}</div>
              {profile?.email && <div className="text-xs text-hub-muted-2">{profile.email}</div>}
            </div>
          </div>

          <SectionTitle>Dados</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {candidateProfile?.education && <Tag>{candidateProfile.education}</Tag>}
            {candidateProfile?.availability && <Tag tone="brand">Disponibilidade: {candidateProfile.availability}</Tag>}
            {candidateProfile?.salary_expectation && (
              <Tag tone="green">Pretensão: {candidateProfile.salary_expectation}</Tag>
            )}
            {!candidateProfile?.education &&
              !candidateProfile?.availability &&
              !candidateProfile?.salary_expectation && (
                <span className="text-xs text-hub-muted">Nenhum dado adicional preenchido pelo candidato.</span>
              )}
          </div>

          <SectionTitle>Habilidades</SectionTitle>
          {skills.length === 0 ? (
            <EmptyNote>Nenhuma habilidade cadastrada.</EmptyNote>
          ) : (
            <div className="space-y-3">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-[12.5px] font-bold">
                    <span>{s.name}</span>
                    <span>{s.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-hub-line">
                    <div
                      className="h-full rounded-full bg-hub-red"
                      style={{ width: `${Math.max(0, Math.min(100, s.level))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <SectionTitle>Experiências</SectionTitle>
          {experiences.length === 0 ? (
            <EmptyNote>Nenhuma experiência cadastrada.</EmptyNote>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp, i) => (
                <div key={i} className="rounded-lg border border-hub-line p-3">
                  <div className="text-[13.5px] font-extrabold">{exp.title || "—"}</div>
                  <div className="text-[12.5px] text-hub-muted-2">
                    {exp.company || "—"} · {exp.months} {exp.months === 1 ? "mês" : "meses"}
                  </div>
                  {exp.description && (
                    <div className="mt-1.5 text-[12.5px] leading-relaxed text-[#4a4a50]">{exp.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <SectionTitle>Currículo</SectionTitle>
          {cvSignedUrl ? (
            <a
              href={cvSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-hub-red hover:underline"
            >
              📄 Baixar currículo (PDF)
            </a>
          ) : (
            <span className="text-xs text-hub-muted">Nenhum currículo enviado.</span>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Régua de match</SectionTitle>
            <StatusSelect applicationId={application.id} status={application.status} />
          </div>
          <Regua score={application.match_score ?? 0} breakdown={application.match_breakdown ?? []} label={name} />
        </Card>
      </div>
    </div>
  );
}
