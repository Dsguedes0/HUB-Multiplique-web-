"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";
import { CandidatoSignupForm } from "./CandidatoSignupForm";
import { EmpresaSignupForm } from "./EmpresaSignupForm";

type Role = "candidato" | "empresa" | "admin";
type Mode = "login" | "signup";

const ROLE_TABS: { id: Role; label: string }[] = [
  { id: "candidato", label: "Candidato" },
  { id: "empresa", label: "Empresa" },
  { id: "admin", label: "Admin" },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>("candidato");
  const [mode, setMode] = useState<Mode>("login");

  function selectRole(nextRole: Role) {
    setRole(nextRole);
    if (nextRole === "admin") setMode("login");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-hub-black md:grid-cols-[1.1fr_1fr]">
      {/* Painel de storytelling da marca */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden px-14 py-16 text-white md:flex"
        style={{ background: "radial-gradient(circle at 15% 15%, #232327, var(--hub-black) 62%)" }}
      >
        <div
          className="pointer-events-none absolute -right-40 -bottom-52 h-[520px] w-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,67,46,.18), transparent 70%)" }}
        />
        <div className="relative z-10">
          <h1 className="mb-4 max-w-[480px] text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.14] tracking-tight">
            O portal para o empreendedor que faz parte da{" "}
            <span className="text-hub-red-light">nossa comunidade</span>.
          </h1>
          <p className="max-w-[420px] text-[15px] leading-relaxed text-[#c9c9cf]">
            O Hub Multiplique conecta empresários da comunidade Poiema e suas vagas de emprego com
            candidatos certos. Os candidatos podem melhorar empregabilidade usando uma régua de match
            transparente e uma trilha de desenvolvimento gerada por IA para cada vaga.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {[
              ["✓", "Vagas visíveis só pra quem tem convite da comunidade"],
              ["%", "Régua de match mostra exatamente onde você está"],
              ["↗", "Trilha de IA indica o que estudar pra fechar o gap"],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-[#d7d7dc]">
                <span className="mt-px flex h-6.5 w-6.5 flex-none items-center justify-center rounded-lg bg-hub-red/15 text-[13px] font-extrabold text-hub-red-light">
                  {icon}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 mt-10 border-t border-white/10 pt-5 text-[12.5px] text-hub-muted">
          Hub Multiplique × Poiema — conectando pessoas e oportunidades reais.
        </div>
      </div>

      {/* Painel de acesso */}
      <div className="flex items-center justify-center bg-hub-paper p-4 sm:p-5">
        <div className="anim-in w-full max-w-[400px] rounded-[20px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.10)] sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-1">
              <Logo variant="light-bg" size={56} showSub={false} />
            </div>
          </div>

          <div className="mb-5 flex rounded-xl bg-hub-paper p-1">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectRole(tab.id)}
                className={`flex-1 rounded-lg px-2 py-2.5 text-[12.5px] font-bold transition-colors duration-200 ${
                  role === tab.id ? "bg-hub-black text-white" : "text-hub-muted-2"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "signup" && role === "candidato" && (
            <div className="mb-5 rounded-lg border border-[#f4c6ba] bg-[#fce8e3] px-3 py-2.5 text-xs font-semibold text-hub-red-dark">
              Cadastro fechado à comunidade — você precisa de um código de convite gerado pelo Hub
              Multiplique.
            </div>
          )}

          {mode === "login" && <LoginForm />}
          {mode === "signup" && role === "candidato" && <CandidatoSignupForm />}
          {mode === "signup" && role === "empresa" && <EmpresaSignupForm />}

          <div className="mt-5 text-center text-[12.5px] text-hub-muted-2">
            {role === "admin" ? (
              <span>Admin não se cadastra sozinho — peça pra alguém do Hub te promover.</span>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-bold text-hub-red-dark"
              >
                {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Fazer login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
