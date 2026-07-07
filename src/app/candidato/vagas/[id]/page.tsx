import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/match/score";
import { PageHeader } from "@/components/DashboardShell";
import { Card, SectionTitle, Tag, Button } from "@/components/ui";
import { Regua } from "@/components/Regua";
import type { JobRequirement } from "@/types/database";
import { applyToJobAction } from "./actions";

export default async function VagaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, description, requirements, modality, seniority, type, companies(name, city)")
    .eq("id", id)
    .single();

  if (!job) notFound();
  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
  const requirements = (job.requirements as JobRequirement[]) ?? [];

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("skills, experiences, education, availability")
    .eq("id", user!.id)
    .single();

  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id, match_score, match_breakdown")
    .eq("job_id", id)
    .eq("candidate_id", user!.id)
    .maybeSingle();

  const match =
    existingApplication?.match_score != null
      ? { score: existingApplication.match_score, breakdown: existingApplication.match_breakdown }
      : computeMatch(
          {
            skills: profile?.skills ?? [],
            experiences: profile?.experiences ?? [],
            education: profile?.education ?? null,
            availability: profile?.availability ?? null,
          },
          requirements
        );

  async function applyAction() {
    "use server";
    await applyToJobAction(id);
  }

  return (
    <div>
      <PageHeader
        title={job.title}
        sub={`${company?.name ?? ""} · ${job.modality} · ${job.seniority ?? ""} ${company?.city ? "· " + company.city : ""}`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <SectionTitle>Sobre a vaga</SectionTitle>
          <p className="text-[13.5px] leading-relaxed text-[#4a4a50]">
            {job.description || "Sem descrição detalhada cadastrada ainda."}
          </p>

          <SectionTitle>Requisitos</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {requirements.length > 0 ? (
              requirements.map((r) => <Tag key={r.skill}>{r.skill}</Tag>)
            ) : (
              <span className="text-xs text-hub-muted">Nenhum requisito específico cadastrado.</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {existingApplication ? (
              <Tag tone="green">✓ Você já se candidatou a essa vaga</Tag>
            ) : (
              <form action={applyAction}>
                <Button type="submit" variant="primary">
                  Candidatar-se a esta vaga
                </Button>
              </form>
            )}
            <Link href={`/candidato/vagas/${id}/trilha`}>
              <Button type="button" variant="brand">
                ✦ Ver minha trilha de desenvolvimento para essa vaga
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <SectionTitle>Régua de match</SectionTitle>
          <Regua score={match.score} breakdown={match.breakdown} />
        </Card>
      </div>
    </div>
  );
}
