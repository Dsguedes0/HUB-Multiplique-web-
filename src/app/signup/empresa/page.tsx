"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpEmpresaAction } from "./actions";
import type { SignupState } from "../candidato/actions";
import { Logo } from "@/components/Logo";
import { Button, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";

const initialState: SignupState = {};

export default function SignupEmpresaPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signUpEmpresaAction, initialState);

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
      <div className="w-full max-w-[460px] rounded-[20px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo variant="light-bg" size={52} showSub={false} />
          <span className="mt-2 text-[11px] font-bold uppercase tracking-widest text-hub-muted-2">
            cadastro de empresa parceira
          </span>
        </div>

        {state.needsEmailConfirm ? (
          <div className="rounded-lg border border-[#c9ecd6] bg-[#e9f7ee] px-4 py-4 text-sm font-semibold text-hub-green">
            Cadastro enviado! Confirme seu e-mail — depois disso, sua empresa fica pendente de
            aprovação do time do Hub Multiplique antes de publicar vagas.
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-lg border border-hub-line bg-hub-paper px-3 py-2.5 text-xs font-semibold text-hub-muted-2">
              Sua empresa fica pendente até um admin do Hub Multiplique aprovar o cadastro.
            </div>

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
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required placeholder="voce@empresa.com" />
              <Label htmlFor="password">Senha</Label>
              <PasswordInput id="password" name="password" required minLength={MIN_PASSWORD_LENGTH} />

              {state.error && (
                <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={pending}>
                {pending ? "Enviando…" : "Cadastrar empresa"}
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
