import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo, LogoMark } from "@/components/Logo";
import { roleHome } from "@/lib/roles";
import { Reveal } from "@/components/Reveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollProgress } from "@/components/ScrollProgress";

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

    redirect(roleHome(profile?.role));
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

const PASSOS_EMPRESA = [
  {
    n: "01",
    titulo: "Publique a vaga e o perfil ideal",
    desc: "Descreva a posição e os requisitos — isso vira o gabarito que a IA usa para comparar cada candidato.",
  },
  {
    n: "02",
    titulo: "Ranking de match automático",
    desc: "Cada candidato chega com o % de aderência à vaga e o porquê — sem filtrar currículo por currículo.",
  },
  {
    n: "03",
    titulo: "Entreviste só quem já bate o gabarito",
    desc: "Veja o gap de cada candidato e decida com dados quem avança para a próxima etapa.",
  },
];

function LandingPage({ vagasCount, empresasCount }: { vagasCount: number; empresasCount: number }) {
  return (
    <div className="min-h-screen bg-hub-paper">
      <ScrollProgress />

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
        <div className="hub-dot-grid pointer-events-none absolute inset-0 opacity-[.12]" />
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
        <Reveal className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center sm:gap-x-14">
          <div>
            <div className="text-[26px] font-extrabold">
              <AnimatedCounter value={vagasCount} />
            </div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-hub-muted-2">Vagas abertas agora</div>
          </div>
          <div>
            <div className="text-[26px] font-extrabold">
              <AnimatedCounter value={empresasCount} />
            </div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-hub-muted-2">Empresas parceiras</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-[26px] font-extrabold">
              <span className="anim-pulse inline-block h-2 w-2 rounded-full bg-hub-red" />
              100%
            </div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-hub-muted-2">Comunidade, por convite</div>
          </div>
        </Reveal>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-[1080px] px-5 py-16 sm:px-7 md:px-16 md:py-24">
        <Reveal className="mb-10 text-center md:mb-14">
          <div className="mx-auto mb-4 flex max-w-[260px] items-baseline justify-center gap-2 border-b border-hub-line pb-3">
            <span className="hub-section-tag">01</span>
            <span className="text-[13px] font-extrabold uppercase tracking-wider text-hub-muted-2">Como funciona</span>
          </div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Do currículo à entrevista, com clareza</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 90} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-hub-line bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,.06)] transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,.12)]">
                <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-hub-red transition-transform duration-300 ease-out group-hover:scale-x-100" />
                <div className="mb-4 font-display text-[28px] text-hub-red transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  {p.n}
                </div>
                <div className="mb-2 text-[15px] font-extrabold">{p.titulo}</div>
                <p className="text-[13.5px] leading-relaxed text-hub-muted-2">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Como funciona (empresas) */}
      <section id="como-funciona-empresas" className="border-t border-hub-line bg-hub-paper px-5 py-16 sm:px-7 md:px-16 md:py-24">
        <Reveal className="mb-10 text-center md:mb-14">
          <div className="mx-auto mb-4 flex max-w-[260px] items-baseline justify-center gap-2 border-b border-hub-line pb-3">
            <span className="hub-section-tag">01</span>
            <span className="text-[13px] font-extrabold uppercase tracking-wider text-hub-muted-2">Como funciona</span>
          </div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Da vaga aberta à contratação certa, com dados</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {PASSOS_EMPRESA.map((p, i) => (
            <Reveal key={p.n} delay={i * 90} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-hub-line bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,.06)] transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,.12)]">
                <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-hub-red transition-transform duration-300 ease-out group-hover:scale-x-100" />
                <div className="mb-4 font-display text-[28px] text-hub-red transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  {p.n}
                </div>
                <div className="mb-2 text-[15px] font-extrabold">{p.titulo}</div>
                <p className="text-[13.5px] leading-relaxed text-hub-muted-2">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 pb-16 sm:px-7 md:px-16 md:pb-24">
        <Reveal className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-6 rounded-[24px] bg-hub-black px-6 py-10 text-center text-white sm:px-10 sm:py-12 md:flex-row md:text-left">
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
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-hub-line px-5 py-9 sm:px-7 md:px-16">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <LogoMark size={30} id="footer" />
          <div className="text-[12px] text-hub-muted">
            Hub Multiplique × Poiema — conectando pessoas e oportunidades reais.
          </div>
        </div>
      </footer>
    </div>
  );
}
