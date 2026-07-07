import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { getOrCreateApplication } from "./actions";
import { TrilhaClient } from "./TrilhaClient";

export default async function TrilhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("title").eq("id", jobId).single();
  const application = await getOrCreateApplication(jobId);

  const { data: track } = await supabase
    .from("development_tracks")
    .select("items")
    .eq("application_id", application.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <PageHeader
        title="Trilha de desenvolvimento"
        sub={`Gerada a partir do gap entre seu perfil e os requisitos da vaga ${job?.title ?? ""}.`}
      />
      <TrilhaClient
        jobId={jobId}
        applicationId={application.id}
        initialItems={track?.items ?? null}
      />
    </div>
  );
}
