import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hub-paper p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-hub-line bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,.10)]">
        <div className="mb-2 text-lg font-extrabold text-hub-black">Página não encontrada</div>
        <p className="mb-5 text-[13.5px] leading-relaxed text-hub-muted-2">
          O link que você acessou não existe ou foi movido.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-hub-red px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-hub-red-dark"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
