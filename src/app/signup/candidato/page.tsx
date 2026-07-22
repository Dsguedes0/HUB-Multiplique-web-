"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpCandidatoAction, type SignupState } from "./actions";
import { Logo } from "@/components/Logo";
import { Button, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";

const initialState: SignupState = {};

export default function SignupCandidatoPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signUpCandidatoAction, initialState);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-5"
      style={{
        background: "radial-gradient(circle at 20% 20%, #1c1c20, var(--hub-black) 60%)",
      }}
    >
      <div className="w-full max-w-[440px] rounded-[20px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo variant="light-bg" size={52} showSub={false} />
          <span className="mt-2 text-[11px] font-bold uppercase tracking-widest text-hub-muted-2">
            cadastro de candidato
          </span>
        </div>

        {state.needsEmailConfirm ? (
          <div className="rounded-lg border border-[#c9ecd6] bg-[#e9f7ee] px-4 py-4 text-sm font-semibold text-hub-green">
            Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar.
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-lg border border-[#f4c6ba] bg-[#fce8e3] px-3 py-2.5 text-xs font-semibold text-hub-red-dark">
              Cadastro fechado à comunidade — você precisa de um código de convite gerado pelo
              Hub Multiplique.
            </div>

            <form action={formAction}>
              <Label htmlFor="fullName">Nome completo</Label>
              <Input id="fullName" name="fullName" required placeholder="Seu nome" />
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required placeholder="voce@email.com" />
              <Label htmlFor="password">Senha</Label>
              <PasswordInput id="password" name="password" required minLength={MIN_PASSWORD_LENGTH} />
              <Label htmlFor="inviteCode">Código de convite</Label>
              <Input id="inviteCode" name="inviteCode" required placeholder="ex: HUB-4F9K2X" />

              {state.error && (
                <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
              )}

              <Button type="submit" variant="brand" className="w-full" disabled={pending}>
                {pending ? "Criando conta…" : "Criar conta"}
              </Button>
            </form>
          </>
        )}

        <div className="mt-5 text-center text-[12.5px] text-hub-muted-2">
          Já tem conta?{" "}
          <Link href="/login" className="font-bold text-hub-red-dark">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
