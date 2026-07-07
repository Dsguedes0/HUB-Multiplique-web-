"use client";

import { useActionState } from "react";
import { createJobAction, type JobFormState } from "../actions";
import { Card, Label, Input, Textarea, Button } from "@/components/ui";
import { PageHeader } from "@/components/DashboardShell";

export default function NovaVagaPage() {
  const [state, formAction, pending] = useActionState<JobFormState, FormData>(
    createJobAction,
    {}
  );

  return (
    <div>
      <PageHeader title="Nova vaga" sub="Publique uma vaga para a comunidade do Hub Multiplique." />
      <Card className="max-w-[560px]">
        <form action={formAction}>
          <Label htmlFor="title">Título da vaga</Label>
          <Input id="title" name="title" required placeholder="ex: Desenvolvedor Back-end Jr" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="modality">Modalidade</Label>
              <select id="modality" name="modality" className="mb-3.5 w-full rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm">
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
                <option value="remoto">Remoto</option>
              </select>
            </div>
            <div>
              <Label htmlFor="seniority">Senioridade</Label>
              <select id="seniority" name="seniority" className="mb-3.5 w-full rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm">
                <option>Júnior</option>
                <option>Pleno</option>
                <option>Sênior</option>
              </select>
            </div>
          </div>

          <Label htmlFor="type">Tipo</Label>
          <select id="type" name="type" className="mb-3.5 w-full rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm">
            <option value="clt">CLT</option>
            <option value="pj">PJ</option>
            <option value="estagio">Estágio</option>
            <option value="temporario">Temporário</option>
          </select>

          <Label htmlFor="requirements">Requisitos (separados por vírgula)</Label>
          <Input id="requirements" name="requirements" placeholder="ex: Node.js, SQL, Git" />

          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" rows={4} placeholder="Descreva a vaga..." />

          {state.error && <div className="mb-3 text-[12.5px] font-semibold text-hub-danger">{state.error}</div>}

          <Button type="submit" variant="primary" className="w-full" disabled={pending}>
            {pending ? "Publicando…" : "Publicar vaga"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
