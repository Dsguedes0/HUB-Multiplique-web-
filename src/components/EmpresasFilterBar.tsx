"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function EmpresasFilterBar({
  basePath,
  sectors,
  q,
  setor,
  destaque,
}: {
  basePath: string;
  sectors: string[];
  q: string;
  setor: string;
  destaque: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(next: { q?: string; setor?: string; destaque?: boolean }) {
    const params = new URLSearchParams();
    const nq = next.q ?? q;
    const nsetor = next.setor ?? setor;
    const ndestaque = next.destaque ?? destaque;
    if (nq) params.set("q", nq);
    if (nsetor) params.set("setor", nsetor);
    if (ndestaque) params.set("destaque", "1");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function onSearchChange(v: string) {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate({ q: v }), 350);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2.5">
      <input
        key={q}
        type="text"
        value={value}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar empresa pelo nome…"
        className="min-w-[220px] flex-1 rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm transition-colors duration-200 focus:border-hub-red focus:bg-white focus:outline-none"
      />
      <select
        value={setor}
        onChange={(e) => navigate({ setor: e.target.value })}
        className="rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm text-hub-black transition-colors duration-200 focus:border-hub-red focus:bg-white focus:outline-none"
      >
        <option value="">Todos os setores</option>
        {sectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => navigate({ destaque: !destaque })}
        aria-pressed={destaque}
        className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition-colors duration-200 ${
          destaque
            ? "border-[#f4c6ba] bg-[#fce8e3] text-hub-red-dark"
            : "border-hub-line bg-white text-hub-muted-2 hover:border-hub-black"
        }`}
      >
        🔥 Mais procuradas primeiro
      </button>
    </div>
  );
}
