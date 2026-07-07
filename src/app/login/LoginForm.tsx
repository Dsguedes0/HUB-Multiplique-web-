"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInAction, type LoginState } from "./actions";
import { Button, Input, Label } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";

const initialState: LoginState = {};

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  return (
    <form action={formAction}>
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" name="email" type="email" placeholder="voce@email.com" required />

      <div className="flex items-center justify-between">
        <Label htmlFor="password">Senha</Label>
        <Link
          href="/forgot-password"
          className="mb-1.5 text-[12px] font-bold text-hub-red-dark hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>
      <PasswordInput id="password" name="password" placeholder="••••••••" required />

      {state.error && (
        <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>
      )}

      <Button type="submit" variant="brand" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
