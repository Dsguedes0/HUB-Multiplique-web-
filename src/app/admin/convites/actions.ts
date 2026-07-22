"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/supabase/require-user";

function randomCode() {
  return "HUB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function generateInviteAction(maxUses: number, daysValid: number) {
  // Checagem explícita de papel além da política de RLS — defesa em
  // profundidade (ver auditoria de código, item #7).
  const { supabase, user } = await requireRole("admin");

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
