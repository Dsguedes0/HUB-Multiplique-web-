"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUpEmpresaAction } from "../signup/empresa/actions";
import type { SignupState } from "../signup/candidato/actions";
import { Button, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";

const initialState: SignupState = {};

export function EmpresaSignupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signUpEmpresaAction, initialState);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  if (state.needsEmailConfirm) {
    return (
      <div className="rounded-lg border border-[#c9ecd6] bg-[#e9f7ee] px-4 py-4 text-sm font-semibold text-hub-green">
        Cadastro enviado! Confirme seu e-mail — depois disso, sua empresa fica pendente de
        aprovação do time do Hub Multiplique antes de publicar vagas.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Label htmlFor="nome">Nome da empresa</Label>
      <Input id="nome" name="nome" required placeholder="ex: TechNova Soluções" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="setor">Setor</Label>
          <Input id="setor" name="setor" placeholder="ex: Tecnologia" />
        </div>
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" name="cidade" placeholder="ex: Taubaté - SP" />
        </div>
      </div>

      <Label htmlFor="responsavel">Responsável pelo cadastro</Label>
      <Input id="responsavel" name="responsavel" required placeholder="Seu nome" />
      <Label htmlFor="empresaEmail">E-mail</Label>
      <Input id="empresaEmail" name="email" type="email" required placeholder="voce@empresa.com" />
      <Label htmlFor="empresaPassword">Senha</Label>
      <PasswordInput id="empresaPassword" name="password" required minLength={MIN_PASSWORD_LENGTH} />

      {state.error && (
        <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Cadastrar empresa"}
      </Button>
    </form>
  );
}
