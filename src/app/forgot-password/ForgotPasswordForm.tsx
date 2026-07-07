"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";
import { Button, Input, Label } from "@/components/ui";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  if (state.sent) {
    return (
      <div className="rounded-lg border border-[#c9ecd6] bg-[#e9f7ee] px-4 py-4 text-sm font-semibold text-hub-green">
        Se esse e-mail tiver uma conta no Hub Multiplique, você vai receber um link para
        redefinir sua senha, enviado pelo Supabase Auth. Confira também a caixa de spam.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" name="email" type="email" placeholder="voce@email.com" required />

      {state.error && (
        <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
      )}

      <Button type="submit" variant="brand" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link de redefinição"}
      </Button>

      <div className="mt-5 text-center text-[12.5px] text-hub-muted-2">
        <Link href="/login" className="font-bold text-hub-red-dark">
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}
