"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction, type ResetPasswordState } from "./actions";
import { Button, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  if (state.done) {
    return (
      <div>
        <div className="mb-4 rounded-lg border border-[#c9ecd6] bg-[#e9f7ee] px-4 py-4 text-sm font-semibold text-hub-green">
          Senha atualizada! Você já pode entrar com a nova senha.
        </div>
        <Button
          type="button"
          variant="brand"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          Ir para o login
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Label htmlFor="password">Nova senha</Label>
      <PasswordInput
        id="password"
        name="password"
        placeholder="••••••••"
        required
        minLength={8}
      />
      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        placeholder="••••••••"
        required
        minLength={8}
      />

      {state.error && (
        <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
      )}

      <Button type="submit" variant="brand" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
