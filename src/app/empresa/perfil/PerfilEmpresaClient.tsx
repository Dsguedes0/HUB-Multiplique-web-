"use client";

import { useActionState } from "react";
import { updateCompanyAction, type CompanyState } from "./actions";
import { Card, Label, Input, Textarea, Button, Tag } from "@/components/ui";

interface Company {
  name: string;
  cnpj: string | null;
  sector: string | null;
  size: string | null;
  city: string | null;
  website: string | null;
  description: string | null;
  status: string;
}

export function PerfilEmpresaClient({ company }: { company: Company }) {
  const [state, formAction, pending] = useActionState<CompanyState, FormData>(
    updateCompanyAction,
    {}
  );

  return (
    <Card className="max-w-[640px]">
      <div className="mb-4">
        {company.status === "pendente" && (
          <Tag tone="amber">Pendente de aprovação do Hub Multiplique</Tag>
        )}
        {company.status === "ativa" && <Tag tone="green">Empresa ativa</Tag>}
        {company.status === "inativa" && <Tag tone="red">Inativa</Tag>}
      </div>

      <form action={formAction}>
        <Label htmlFor="name">Nome da empresa</Label>
        <Input id="name" name="name" defaultValue={company.name} required />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" defaultValue={company.cnpj ?? ""} />
          </div>
          <div>
            <Label htmlFor="sector">Setor</Label>
            <Input id="sector" name="sector" defaultValue={company.sector ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="size">Porte</Label>
            <Input id="size" name="size" defaultValue={company.size ?? ""} placeholder="ex: 10-20 funcionários" />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" defaultValue={company.city ?? ""} />
          </div>
        </div>
        <Label htmlFor="website">Site</Label>
        <Input id="website" name="website" defaultValue={company.website ?? ""} />
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={company.description ?? ""} />

        {state.error && <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>}
        {state.ok && <div className="mb-3 text-[12.5px] font-semibold text-hub-green">Salvo!</div>}

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
