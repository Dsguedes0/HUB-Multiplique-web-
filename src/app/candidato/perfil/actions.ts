"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aiProvider, type CvExtraction } from "@/lib/ai/provider";
import type { CandidateExperience, CandidateSkill } from "@/types/database";

export interface ProfilePayload {
  fullName: string;
  availability: string;
  salaryExpectation: string;
  education: string;
  skills: CandidateSkill[];
  experiences: CandidateExperience[];
}

export async function saveProfileAction(payload: ProfilePayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  await supabase.from("profiles").update({ full_name: payload.fullName }).eq("id", user.id);

  const { error } = await supabase
    .from("candidate_profiles")
    .update({
      availability: payload.availability,
      salary_expectation: payload.salaryExpectation,
      education: payload.education,
      skills: payload.skills,
      experiences: payload.experiences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/candidato/perfil");
}

export interface CvUploadResult {
  error?: string;
  cvUrl?: string;
  extraction?: CvExtraction;
}

export async function uploadAndExtractCvAction(formData: FormData): Promise<CvUploadResult> {
  const file = formData.get("cv") as File | null;
  if (!file || file.size === 0) return { error: "Selecione um arquivo PDF." };
  if (file.type !== "application/pdf") return { error: "O currículo precisa ser um PDF." };
  if (file.size > 5 * 1024 * 1024) return { error: "Arquivo muito grande (máx. 5MB)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const path = `${user.id}/curriculo.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("cvs")
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });
  if (uploadError) return { error: uploadError.message };

  await supabase
    .from("candidate_profiles")
    .update({ cv_url: path, cv_parsed_at: new Date().toISOString() })
    .eq("id", user.id);

  try {
    const base64 = Buffer.from(bytes).toString("base64");
    const extraction = await aiProvider.extractCvData(base64);
    revalidatePath("/candidato/perfil");
    return { cvUrl: path, extraction };
  } catch (err) {
    return {
      cvUrl: path,
      error:
        err instanceof Error
          ? `Currículo salvo, mas a extração automática falhou: ${err.message}`
          : "Currículo salvo, mas a extração automática falhou.",
    };
  }
}
