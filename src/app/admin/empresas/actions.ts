"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/supabase/require-user";

export async function approveCompanyAction(companyId: string) {
  // Checagem explícita de papel além da RLS — defesa em profundidade.
  const { supabase } = await requireRole("admin");
  const { error } = await supabase
    .from("companies")
    .update({ status: "ativa" })
    .eq("id", companyId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/empresas");
}
