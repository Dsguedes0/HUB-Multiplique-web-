"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase
    .from("companies")
    .update({
      name: String(formData.get("name") || ""),
      cnpj: String(formData.get("cnpj") || "") || null,
      sector: String(formData.get("sector") || "") || null,
      size: String(formData.get("size") || "") || null,
      city: String(formData.get("city") || "") || null,
      website: String(formData.get("website") || "") || null,
      description: String(formData.get("description") || "") || null,
    })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/empresa/perfil");
  return { ok: true };
}
