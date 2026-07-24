import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyNote, Tag } from "@/components/ui";
import { EmpresasFilterBar } from "@/components/EmpresasFilterBar";
import { Pagination } from "@/components/Pagination";
import { initialColor } from "@/lib/ui/avatar-color";

const PAGE_SIZE = 20;

export interface EmpresasSearchParams {
  q?: string;
  setor?: string;
  destaque?: string;
  page?: string;
}

export async function EmpresasBrowser({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams: EmpresasSearchParams;
}) {
  const supabase = await createClient();
  const q = (searchParams.q ?? "").trim();
  const setor = searchParams.setor ?? "";
  const destaque = searchParams.destaque === "1";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  let query = supabase
    .from("companies")
    .select("id, name, sector, size, city, website, logo_url, jobs(count)")
    .eq("status", "ativa")
    .eq("jobs.status", "aberta");

  if (q) query = query.ilike("name", `%${q}%`);
  if (setor) query = query.eq("sector", setor);

  const { data: companies } = await query.order("name");

  const { data: sectorRows } = await supabase
    .from("companies")
    .select("sector")
    .eq("status", "ativa")
    .not("sector", "is", null);

  const sectors = Array.from(
    new Set((sectorRows ?? []).map((r) => r.sector).filter((s): s is string => !!s))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const list = (companies ?? []).map((c) => ({
    ...c,
    openJobs: Array.isArray(c.jobs) ? c.jobs[0]?.count ?? 0 : 0,
  }));

  const popularIds = new Set(
    [...list]
      .filter((c) => c.openJobs > 0)
      .sort((a, b) => b.openJobs - a.openJobs)
      .slice(0, 3)
      .map((c) => c.id)
  );

  if (destaque) {
    list.sort((a, b) => b.openJobs - a.openJobs || a.name.localeCompare(b.name, "pt-BR"));
  }

  // Paginação em memória sobre o resultado já filtrado/ordenado — mais
  // simples e sem risco de "populares" ficar incorreto entre páginas, ao
  // custo de buscar todas as empresas que batem o filtro a cada request.
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Empresas"
        sub="Conheça as empresas parceiras cadastradas no Hub Multiplique."
      />

      <EmpresasFilterBar basePath={basePath} sectors={sectors} q={q} setor={setor} destaque={destaque} />

      {list.length === 0 ? (
        <EmptyNote>Nenhuma empresa encontrada com esse filtro.</EmptyNote>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {pageItems.map((c) => {
            const isPopular = popularIds.has(c.id);
            const card = (
              <div className="flex h-full flex-col gap-3 rounded-xl border border-hub-line bg-white p-4 transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-hub-red hover:shadow-[0_16px_36px_rgba(0,0,0,.12)] sm:p-4.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-[10px] text-[15px] font-extrabold text-white"
                    style={{ background: initialColor(c.name) }}
                  >
                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      c.name[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[14.5px] font-extrabold">{c.name}</div>
                    <div className="truncate text-xs text-hub-muted-2">
                      {[c.sector, c.city].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  {c.size && <Tag>{c.size}</Tag>}
                  <Tag tone={c.openJobs > 0 ? "green" : "neutral"}>
                    {c.openJobs} {c.openJobs === 1 ? "vaga aberta" : "vagas abertas"}
                  </Tag>
                  {isPopular && <Tag tone="brand">🔥 Mais procurada</Tag>}
                </div>
              </div>
            );

            return c.website ? (
              <a key={c.id} href={c.website} target="_blank" rel="noopener noreferrer">
                {card}
              </a>
            ) : (
              <div key={c.id}>{card}</div>
            );
          })}
        </div>
      )}

      <Pagination
        basePath={basePath}
        params={{ q, setor, destaque: destaque ? "1" : undefined }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
