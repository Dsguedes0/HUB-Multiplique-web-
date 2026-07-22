import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { Tag } from "@/components/ui";
import { ApproveButton } from "./ApproveButton";
import { initialColor } from "@/lib/ui/avatar-color";

export default async function AdminEmpresasPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, sector, city, status")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Empresas parceiras"
        sub="Aprove novas empresas antes que elas possam publicar vagas."
      />

      <div className="space-y-2.5">
        {(companies ?? []).map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hub-line bg-white p-4 transition-colors duration-200 hover:bg-hub-paper sm:p-4.5"
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
              <div
                className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] text-[15px] font-extrabold text-white"
                style={{ background: initialColor(c.name) }}
              >
                {c.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-[14.5px] font-extrabold">{c.name}</div>
                <div className="text-xs text-hub-muted-2">
                  {c.sector} {c.city ? `· ${c.city}` : ""}
                </div>
              </div>
            </div>
            <div className="ml-auto flex flex-none items-center gap-2.5 sm:ml-0">
              {c.status === "pendente" && (
                <>
                  <Tag tone="amber">pendente</Tag>
                  <ApproveButton companyId={c.id} />
                </>
              )}
              {c.status === "ativa" && <Tag tone="green">ativa</Tag>}
              {c.status === "inativa" && <Tag tone="red">inativa</Tag>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
