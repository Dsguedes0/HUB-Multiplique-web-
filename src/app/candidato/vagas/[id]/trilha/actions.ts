"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/match/score";
import { aiProvider } from "@/lib/ai/provider";
import { checkAiCooldown } from "@/lib/ai/rate-limit";
import type { JobRequirement } from "@/types/database";

export async function getOrCreateApplication(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: existing } = await supabase
    .from("applications")
    .select("id, match_score, match_breakdown")
    .eq("job_id", jobId)
    .eq("candidate_id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const { data: job } = await supabase
    .from("jobs")
    .select("requirements")
    .eq("id", jobId)
    .single();
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
    (job?.requirements as JobRequirement[]) ?? []
  );

  const { data: created, error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      match_score: score,
      match_breakdown: breakdown,
      status: "candidatou",
    })
    .select("id, match_score, match_breakdown")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export interface TrackState {
  error?: string;
  items?: import("@/types/database").TrackItem[];
}

export async function generateTrackAction(
  jobId: string,
  applicationId: string,
  _prev: TrackState
): Promise<TrackState> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    // Cooldown contra a cota diária compartilhada do Gemini, por candidatura.
    const { data: lastTrack } = await supabase
      .from("development_tracks")
      .select("generated_at")
      .eq("application_id", applicationId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const cooldownError = checkAiCooldown(lastTrack?.generated_at);
    if (cooldownError) return { error: cooldownError };

    const { data: job } = await supabase
      .from("jobs")
      .select("title, requirements")
      .eq("id", jobId)
      .single();

    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("skills")
      .eq("id", user.id)
      .single();

    const { data: application } = await supabase
      .from("applications")
      .select("match_breakdown")
      .eq("id", applicationId)
      .single();

    const requirements = (job?.requirements as JobRequirement[]) ?? [];

    const items = await aiProvider.generateDevelopmentTrack({
      jobTitle: job?.title ?? "",
      jobRequirements: requirements.map((r) => r.skill),
      candidateSkills: profile?.skills ?? [],
      matchBreakdown: application?.match_breakdown ?? [],
    });

    const { error } = await supabase.from("development_tracks").insert({
      application_id: applicationId,
      items,
      ai_model_used: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });
    if (error) return { error: error.message };

    revalidatePath(`/candidato/vagas/${jobId}/trilha`);
    return { items };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao gerar a trilha com IA." };
  }
}
