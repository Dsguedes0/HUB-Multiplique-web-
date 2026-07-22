"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { companyPayloadSchema, sanitizeUrl } from "@/lib/validation/company";

export interface CompanyState {
  error?: string;
  ok?: boolean;
}

export async function updateCompanyAction(
  _prev: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const parsed = companyPayloadSchema.safeParse({
    name: String(formData.get("name") || ""),
    cnpj: String(formData.get("cnpj") || "") || null,
    sector: String(formData.get("sector") || "") || null,
    size: String(formData.get("size") || "") || null,
    city: String(formData.get("city") || "") || null,
    description: String(formData.get("description") || "") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  // O site da empresa é exibido como link (`<a href>`) para candidatos e
  // outras empresas em /candidato/empresas e /empresa/empresas. Sem validar
  // o esquema da URL, um valor como "javascript:..." ficava gravado e era
  // renderizado sem sanitização — um vetor de XSS armazenado (ver auditoria
  // de código, item #2). Um site com formato inválido é silenciosamente
  // descartado (vira null) em vez de bloquear o salvamento do resto do perfil.
  const website = sanitizeUrl(String(formData.get("website") || ""));

  const { error } = await supabase
    .from("companies")
    .update({ ...parsed.data, website })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/empresa/perfil");
  return { ok: true };
}
