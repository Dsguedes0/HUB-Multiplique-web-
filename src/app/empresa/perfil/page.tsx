import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { PerfilEmpresaClient } from "./PerfilEmpresaClient";

export default async function PerfilEmpresaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  return (
    <div>
      <PageHeader
        title="Dados da empresa"
        sub="Essas informações aparecem para os candidatos da comunidade assim que sua empresa for aprovada."
      />
      <PerfilEmpresaClient
        company={{
          name: company?.name ?? "",
          cnpj: company?.cnpj ?? null,
          sector: company?.sector ?? null,
          size: company?.size ?? null,
          city: company?.city ?? null,
          website: company?.website ?? null,
          description: company?.description ?? null,
          status: company?.status ?? "pendente",
        }}
      />
    </div>
  );
}
