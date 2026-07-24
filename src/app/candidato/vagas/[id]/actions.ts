"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/match/score";
import type { JobRequirement } from "@/types/database";

export async function applyToJobAction(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: job } = await supabase
    .from("jobs")
    .select("requirements")
    .eq("id", jobId)
    .single();
  if (!job) throw new Error("Vaga não encontrada.");

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("skills, experiences, education, availability")
    .eq("id", user.id)
    .single();

  const { score, breakdown } = computeMatch(
    {
      skills: profile?.skills ?? [],
      experiences: profile?.experiences ?? [],
      education: profile?.education ?? null,
      availability: profile?.availability ?? null,
    },
    (job.requirements as JobRequirement[]) ?? []
  );

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    candidate_id: user.id,
    match_score: score,
    match_breakdown: breakdown,
    status: "candidatou",
  });

  // 23505 = unique_violation (já se candidatou) — checa pelo código, não
  // pelo texto da mensagem, que muda entre idiomas/versões do Postgres.
  if (error && error.code !== "23505") throw new Error(error.message);

  revalidatePath(`/candidato/vagas/${jobId}`);
  revalidatePath("/candidato/candidaturas");
}
