import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { PerfilClient } from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <PageHeader
        title="Meu perfil"
        sub="Perfil estruturado + currículo — é o que alimenta a régua de match com cada vaga."
      />
      <PerfilClient
        initial={{
          fullName: profile?.full_name ?? "",
          availability: candidateProfile?.availability ?? "",
          salaryExpectation: candidateProfile?.salary_expectation ?? "",
          education: candidateProfile?.education ?? "",
          skills: candidateProfile?.skills ?? [],
          experiences: candidateProfile?.experiences ?? [],
          cvUrl: candidateProfile?.cv_url ?? null,
        }}
      />
    </div>
  );
}
