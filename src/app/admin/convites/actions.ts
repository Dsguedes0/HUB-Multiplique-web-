"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function randomCode() {
  return "HUB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function generateInviteAction(maxUses: number, daysValid: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);

  const { error } = await supabase.from("invite_codes").insert({
    code: randomCode(),
    created_by: user.id,
    max_uses: maxUses,
    expires_at: expiresAt.toISOString(),
    active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/convites");
}
