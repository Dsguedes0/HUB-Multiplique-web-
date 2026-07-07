"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JobModality, JobRequirement, JobType } from "@/types/database";

export interface JobFormState {
  error?: string;
}

export async function createJobAction(
  _prev: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: company } = await supabase
    .from("companies")
    .select("id, status")
    .eq("owner_id", user.id)
    .single();

  if (!company) return { error: "Empresa não encontrada." };
  if (company.status !== "ativa") {
    return { error: "Sua empresa ainda não foi aprovada pelo Hub Multiplique." };
  }

  const requirementsRaw = String(formData.get("requirements") || "");
  const requirements: JobRequirement[] = requirementsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((skill) => ({ skill, weight: 3, level_required: 60 }));

  const { error } = await supabase.from("jobs").insert({
    company_id: company.id,
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || "") || null,
    seniority: String(formData.get("seniority") || "") || null,
    type: (String(formData.get("type") || "clt") as JobType),
    modality: (String(formData.get("modality") || "presencial") as JobModality),
    requirements,
    status: "aberta",
  });

  if (error) return { error: error.message };

  revalidatePath("/empresa/vagas");
  redirect("/empresa/vagas");
}

export async function updateApplicationStatusAction(applicationId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/empresa/vagas");
}
