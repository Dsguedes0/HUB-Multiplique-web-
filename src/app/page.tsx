import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo, LogoMark } from "@/components/Logo";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/empresas",
  empresa: "/empresa/vagas",
  candidato: "/candidato/vagas",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    redirect(ROLE_HOME[profile?.role ?? "candidato"]);
  }

  const [{ count: vagasCount }, { count: empresasCount }] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "aberta"),
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("status", "ativa"),
  ]);

  return <LandingPage vagasCount={vagasCount ?? 0} empresasCount={empresasCount ?? 0} />;
}

const PASSOS = [
  {
    n: "01",
    titulo: "Seu perfil vira sua régua",
    desc: "Suba seu currículo, a IA extrai suas habilidades e experiências — isso alimenta a comparação com cada vaga.",
  },
  {
    n: "02",
    titulo: "Régua de match transparente",
    desc: "Pra cada vaga, você vê exatamente seu % de aderência e por quê — sem caixa-preta.",
  },
  {
    n: "03",
    titulo: "Trilha de desenvolvimento com IA",
    desc: "O gap entre seu perfil e a vaga vira um plano prático: cursos, projetos e prazos sugeridos.",
  },
];

function LandingPage({ vagasCount, empresasCount }: { vagasCount: number; empresasCount: number }) {
  return (
    <div className="min-h-screen bg-hub-paper">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[.06] bg-hub-black/90 px-4 py-3 backdrop-blur-md sm:px-7 sm:py-3.5">
        <Logo variant="dark-bg" size={32} showSub={false} />
        <Link
          href="/login"
          className="flex-none rounded-full bg-hub-red px-4 py-2 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-hub-red-dark hover:shadow-[0_10px_24px_rgba(232,67,46,.28)] sm:px-5"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-5 py-16 text-white sm:px-7 md:px-16 md:py-24"
        style={{ background: "radial-gradient(circle at 15% 15%, #232327, var(--hub-black) 62%)" }}
      >
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,67,46,.18), transparent 70%)" }}
        />
        <div className="anim-in relative z-10 mx-auto max-w-[720px] text-center">
          <h1 className="mb-5 text-[clamp(30px,4.6vw,48px)] font-extrabold leading-[1.12] tracking-tight">
            O trabalho certo pra quem faz parte da <span className="text-hub-red-light">nossa comunidade</span>.
          </h1>
          <p className="mx-auto max-w-[540px] text-[15.5px] leading-relaxed text-[#c9c9cf]">
            O Hub Multiplique conecta candidatos da comunidade Poiema a empresas parceiras, com uma
            régua de match transparente e uma trilha de desenvolvimento gerada por IA para cada vaga.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="rounded-full bg-hub-red px-6 py-3 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-hub-red-dark hover:shadow-[0_10px_24px_rgba(232,67,46,.28)]"
            >
              Acessar minha conta
            </Link>
            <a
              href="#como-funciona"
              className="rounded-full border border-white/20 px-6 py-3 text-[14px] font-bold text-white transition-colors duration-200 hover:border-hub-red-light hover:text-hub-red-light"
            >
              Como funciona
            </a>
          </div>
        </div>
      </section>

      {/* Faixa de estatísticas */}
      <section className="border-b border-hub-line bg-white px-5 py-6 sm:px-7 md:px-16">
        <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center sm:gap-x-14">
          <div>
            <div className="text-[26px] font-extrabold">{vagasCount}</div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-hub-muted-2">Vagas abertas agora</div>
          </div>
          <div>
            <div className="text-[26px] font-extrabold">{empresasCount}</div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-hub-muted-2">Empresas parceiras</div>
          </div>
          <div>
            <div className="text-[26px] font-extrabold">100%</div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-hub-muted-2">Comunidade, por convite</div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-[1080px] px-5 py-16 sm:px-7 md:px-16 md:py-24">
        <div className="mb-10 text-center md:mb-14">
          <div className="mb-3 flex items-center justify-center gap-2 text-[13px] font-extrabold uppercase tracking-wider text-hub-muted-2">
            <span className="h-3 w-[3px] rounded-sm bg-hub-red" /> Como funciona
          </div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Do currículo à entrevista, com clareza</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {PASSOS.map((p) => (
            <div
              key={p.n}
              className="rounded-2xl border border-hub-line bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,.06)] transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,.12)]"
            >
              <div className="mb-4 font-display text-[28px] text-hub-red">{p.n}</div>
              <div className="mb-2 text-[15px] font-extrabold">{p.titulo}</div>
              <p className="text-[13.5px] leading-relaxed text-hub-muted-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 pb-16 sm:px-7 md:px-16 md:pb-24">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-6 rounded-[24px] bg-hub-black px-6 py-10 text-center text-white sm:px-10 sm:py-12 md:flex-row md:text-left">
          <div>
            <div className="mb-2 text-[20px] font-extrabold">Faz parte da comunidade Poiema?</div>
            <p className="max-w-md text-[13.5px] leading-relaxed text-[#c9c9cf]">
              O acesso é fechado — você precisa de um código de convite gerado pelo Hub Multiplique para se cadastrar.
            </p>
          </div>
          <Link
            href="/login"
            className="flex-none rounded-full bg-hub-red px-6 py-3 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-hub-red-dark hover:shadow-[0_10px_24px_rgba(232,67,46,.28)]"
          >
            Entrar com meu convite
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hub-line px-5 py-9 sm:px-7 md:px-16">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <LogoMark size={30} id="footer" />
          <div className="text-[12px] text-hub-muted">
            Hub Multiplique × Poiema — conectando pessoas e oportunidades reais em Taubaté e região.
          </div>
        </div>
      </footer>
    </div>
  );
}
