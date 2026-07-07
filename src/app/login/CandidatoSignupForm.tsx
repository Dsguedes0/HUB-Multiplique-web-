"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUpCandidatoAction, type SignupState } from "../signup/candidato/actions";
import { Button, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";

const initialState: SignupState = {};

export function CandidatoSignupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signUpCandidatoAction, initialState);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  if (state.needsEmailConfirm) {
    return (
      <div className="rounded-lg border border-[#c9ecd6] bg-[#e9f7ee] px-4 py-4 text-sm font-semibold text-hub-green">
        Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Label htmlFor="fullName">Nome completo</Label>
      <Input id="fullName" name="fullName" required placeholder="Seu nome" />
      <Label htmlFor="signupEmail">E-mail</Label>
      <Input id="signupEmail" name="email" type="email" required placeholder="voce@email.com" />
      <Label htmlFor="signupPassword">Senha</Label>
      <PasswordInput id="signupPassword" name="password" required minLength={6} />
      <Label htmlFor="inviteCode">Código de convite</Label>
      <Input id="inviteCode" name="inviteCode" required placeholder="ex: HUB-4F9K2X" />

      {state.error && (
        <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
      )}

      <Button type="submit" variant="brand" className="w-full" disabled={pending}>
        {pending ? "Criando conta…" : "Criar conta"}
      </Button>
    </form>
  );
}
