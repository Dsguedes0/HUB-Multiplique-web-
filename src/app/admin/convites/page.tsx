import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/DashboardShell";
import { Card, EmptyNote, Tag } from "@/components/ui";
import { GenerateButton } from "./GenerateButton";

export default async function AdminConvitesPage() {
  const supabase = await createClient();
  const { data: invites } = await supabase
    .from("invite_codes")
    .select("code, uses_count, max_uses, expires_at, active")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Códigos de convite"
        sub="Controle de acesso da comunidade — só entra quem tem um código válido."
      />

      <div className="mb-4">
        <GenerateButton />
      </div>

      <Card className="overflow-x-auto">
        {!invites || invites.length === 0 ? (
          <EmptyNote>Nenhum código gerado ainda.</EmptyNote>
        ) : (
          <table className="w-full min-w-[460px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-hub-line text-left text-[11px] uppercase tracking-wide text-hub-muted-2">
                <th className="px-2.5 py-2">Código</th>
                <th className="px-2.5 py-2">Usos</th>
                <th className="px-2.5 py-2">Validade</th>
                <th className="px-2.5 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.code} className="border-b border-hub-line last:border-none">
                  <td className="px-2.5 py-2.5 font-extrabold">{i.code}</td>
                  <td className="px-2.5 py-2.5">
                    {i.uses_count}/{i.max_uses}
                  </td>
                  <td className="px-2.5 py-2.5">
                    {i.expires_at ? new Date(i.expires_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-2.5 py-2.5">
                    <Tag tone={i.active ? "green" : "neutral"}>{i.active ? "ativo" : "inativo"}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
