import type { MatchBreakdownItem } from "@/types/database";

export function Regua({
  score,
  breakdown,
  label = "Você",
}: {
  score: number;
  breakdown: MatchBreakdownItem[];
  label?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold">{score}%</span>
        <span className="text-sm font-semibold text-hub-muted-2">de aderência à vaga</span>
      </div>

      <div className="relative my-6 h-3.5 rounded-full bg-gradient-to-r from-[#e6635f] via-hub-amber via-45% to-hub-green">
        <div
          className="absolute -top-8 flex -translate-x-1/2 flex-col items-center transition-[left] duration-500"
          style={{ left: `${Math.min(Math.max(score, 0), 100)}%` }}
        >
          <span className="mb-0.5 whitespace-nowrap rounded-md bg-hub-black px-2 py-0.5 text-[11px] font-extrabold text-white">
            {label}
          </span>
          <span className="h-3.5 w-0.5 bg-hub-black" />
        </div>
      </div>
      <div className="flex justify-between text-[10.5px] font-bold uppercase tracking-wide text-hub-muted">
        <span>Baixo match</span>
        <span>Match perfeito</span>
      </div>

      <div className="mt-6 space-y-3.5">
        {breakdown.map((c) => (
          <div key={c.criterio}>
            <div className="mb-1.5 flex justify-between text-[12.5px] font-bold">
              <span>{c.criterio}</span>
              <span>{c.valor}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-hub-line">
              <div
                className="h-full rounded-full bg-hub-red transition-[width] duration-500"
                style={{ width: `${c.valor}%` }}
              />
            </div>
            <div className="mt-1 text-[11.5px] text-hub-muted">{c.obs}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
