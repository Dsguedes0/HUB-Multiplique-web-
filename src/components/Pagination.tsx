import Link from "next/link";

/** Paginação via URL (?page=N), no mesmo padrão do EmpresasFilterBar. */
export function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) usp.set(k, v);
    }
    if (p > 1) usp.set("page", String(p));
    const qs = usp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
        className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors duration-200 ${
          prevDisabled
            ? "pointer-events-none border-hub-line text-hub-muted opacity-50"
            : "border-hub-line hover:border-hub-black"
        }`}
      >
        ← Anterior
      </Link>
      <span className="text-[12.5px] font-semibold text-hub-muted-2">
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors duration-200 ${
          nextDisabled
            ? "pointer-events-none border-hub-line text-hub-muted opacity-50"
            : "border-hub-line hover:border-hub-black"
        }`}
      >
        Próxima →
      </Link>
    </div>
  );
}
