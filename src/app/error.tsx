"use client";

import { useEffect } from "react";

/** Error boundary de última instância para exceções não tratadas na árvore de rotas. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hub-paper p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-hub-line bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,.10)]">
        <div className="mb-2 text-lg font-extrabold text-hub-black">Algo deu errado</div>
        <p className="mb-5 text-[13.5px] leading-relaxed text-hub-muted-2">
          Não conseguimos completar essa ação. Tente de novo — se o problema continuar, avise o
          time do Hub Multiplique.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-hub-black px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#232327]"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
