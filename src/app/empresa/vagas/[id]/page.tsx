import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyNote } from "@/components/ui";
import { StatusSelect } from "./StatusSelect";

function initialColor(name: string) {
  const colors = ["#e8432e", "#2f9e5b", "#3d6fb4", "#b4573d", "#7a5cc9"];
  let h = 0;
  for (const c of name) h += c.charCodeAt(0);
  return colors[h % colors.length];
}

export default async function VagaCandidatosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("title").eq("id", id).single();
  if (!job) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, match_score, status, profiles(full_name)")
    .eq("job_id", id)
    .order("match_score", { ascending: false });

  return (
    <div>
      <PageHeader
        title={job.title}
        sub="Candidatos ranqueados pela régua de match — do mais aderente ao menos aderente."
      />

      {!applications || applications.length === 0 ? (
        <EmptyNote>Ainda não há candidatos para essa vaga.</EmptyNote>
      ) : (
        <div className="space-y-2.5">
          {applications.map((a) => {
            const candidate = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
            const name = candidate?.full_name ?? "Candidato";
            const score = a.match_score ?? 0;
            const barColor = score >= 75 ? "#2f9e5b" : score >= 55 ? "#dba53a" : "#d9534f";
            return (
              <div
                key={a.id}
                className="flex flex-col gap-3.5 rounded-xl border border-hub-line bg-white p-4 transition-colors duration-200 hover:bg-hub-paper sm:flex-row sm:items-center sm:justify-between sm:p-4.5"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] text-[15px] font-extrabold text-white"
                    style={{ background: initialColor(name) }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <div className="text-[14.5px] font-extrabold">{name}</div>
                    <div className="text-xs text-hub-muted-2">Candidatura recebida</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                  <div className="min-w-[80px] flex-1 sm:w-[140px] sm:flex-none">
                    <div className="h-2 overflow-hidden rounded-full bg-hub-line">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, background: barColor }}
                      />
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[12px] font-extrabold" style={{ color: barColor }}>
                    {score}% match
                  </span>
                  <StatusSelect applicationId={a.id} status={a.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
