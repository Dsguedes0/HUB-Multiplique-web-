"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createJobSchema,
  applicationStatusSchema,
  jobRequirementSchema,
} from "@/lib/validation/job";
import type { JobRequirement } from "@/types/database";
import { z } from "zod";

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

  // Requisitos agora chegam como JSON (montado pelo RequirementsEditor no
  // cliente), com peso e nível mínimo configuráveis por habilidade — antes
  // todo requisito era gravado com weight:3/level_required:60 fixos, o que
  // reduzia a régua de match a um cálculo essencialmente de peso igual,
  // apesar do motor de match já suportar diferenciação (ver auditoria de
  // código, item #19).
  let requirements: JobRequirement[] = [];
  const requirementsRaw = String(formData.get("requirementsJson") || "[]");
  try {
    const parsedRequirements = z.array(jobRequirementSchema).safeParse(JSON.parse(requirementsRaw));
    if (parsedRequirements.success) requirements = parsedRequirements.data;
  } catch {
    // JSON malformado é tratado como "sem requisitos" — melhor publicar a
    // vaga sem requisitos do que falhar a criação inteira por causa disso.
  }

  const parsed = createJobSchema.safeParse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || "") || undefined,
    seniority: String(formData.get("seniority") || "") || undefined,
    type: String(formData.get("type") || "clt"),
    modality: String(formData.get("modality") || "presencial"),
    requirements,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados da vaga inválidos." };
  }

  const { error } = await supabase.from("jobs").insert({
    company_id: company.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    seniority: parsed.data.seniority ?? null,
    type: parsed.data.type,
    modality: parsed.data.modality,
    requirements: parsed.data.requirements,
    status: "aberta",
  });

  if (error) return { error: error.message };

  revalidatePath("/empresa/vagas");
  redirect("/empresa/vagas");
}

export async function updateApplicationStatusAction(applicationId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  // O <select> só oferece os valores válidos, mas a action em si é um
  // endpoint chamável diretamente — validar contra o enum evita gravar um
  // status arbitrário no banco (ver auditoria de código, item #1).
  const parsedStatus = applicationStatusSchema.safeParse(status);
  if (!parsedStatus.success) throw new Error("Status inválido.");

  // Checagem explícita de posse (a candidatura precisa pertencer a uma vaga
  // de uma empresa do próprio usuário) além da política de RLS — defesa em
  // profundidade (ver auditoria de código, item #7).
  const { data: application } = await supabase
    .from("applications")
    .select("id, jobs(company_id, companies(owner_id))")
    .eq("id", applicationId)
    .single();

  const job = Array.isArray(application?.jobs) ? application.jobs[0] : application?.jobs;
  const company = job?.companies
    ? Array.isArray(job.companies)
      ? job.companies[0]
      : job.companies
    : null;
  if (!company || company.owner_id !== user.id) {
    throw new Error("Você não tem permissão para atualizar essa candidatura.");
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: parsedStatus.data })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/empresa/vagas");
}
