"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aiProvider, type CvExtraction } from "@/lib/ai/provider";
import { profilePayloadSchema, type ProfilePayloadInput } from "@/lib/validation/profile";
import { checkAiCooldown } from "@/lib/ai/rate-limit";

export type ProfilePayload = ProfilePayloadInput;

export async function saveProfileAction(payload: ProfilePayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  // zod garante os limites (level/months etc.) independente do que a UI já
  // filtra no cliente — sem isso a régua de match quebrava visualmente.
  const parsed = profilePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados de perfil inválidos.");
  }
  const data = parsed.data;

  await supabase.from("profiles").update({ full_name: data.fullName }).eq("id", user.id);

  const { error } = await supabase
    .from("candidate_profiles")
    .update({
      availability: data.availability,
      salary_expectation: data.salaryExpectation,
      education: data.education,
      skills: data.skills,
      experiences: data.experiences,
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

  // Cooldown contra abuso da cota diária compartilhada do Gemini.
  const { data: existingProfile } = await supabase
    .from("candidate_profiles")
    .select("cv_parsed_at")
    .eq("id", user.id)
    .single();
  const cooldownError = checkAiCooldown(existingProfile?.cv_parsed_at);
  if (cooldownError) return { error: cooldownError };

  const bytes = new Uint8Array(await file.arrayBuffer());

  // `file.type` é só o Content-Type declarado pelo cliente, não garante o
  // conteúdo real — confirma a assinatura binária do PDF antes de seguir.
  const header = new TextDecoder("latin1").decode(bytes.slice(0, 5));
  if (header !== "%PDF-") {
    return { error: "O arquivo não parece ser um PDF válido." };
  }

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

export interface CvDeleteResult {
  error?: string;
  ok?: boolean;
}

export async function deleteCvAction(): Promise<CvDeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const path = `${user.id}/curriculo.pdf`;

  const { error: removeError } = await supabase.storage.from("cvs").remove([path]);
  // Ignora "objeto não existe" — o que importa é limpar cv_url de qualquer forma.
  if (removeError && !/not.*found/i.test(removeError.message)) {
    return { error: removeError.message };
  }

  const { error: updateError } = await supabase
    .from("candidate_profiles")
    .update({ cv_url: null, cv_parsed_at: null })
    .eq("id", user.id);
  if (updateError) return { error: updateError.message };

  revalidatePath("/candidato/perfil");
  return { ok: true };
}
