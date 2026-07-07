"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveCompanyAction(companyId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ status: "ativa" })
    .eq("id", companyId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/empresas");
}
