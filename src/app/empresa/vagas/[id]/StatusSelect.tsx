"use client";

import { useTransition } from "react";
import { updateApplicationStatusAction } from "../actions";

const OPTIONS = ["candidatou", "visualizado", "entrevista", "rejeitado", "contratado"];
const LABEL: Record<string, string> = {
  candidatou: "Em análise",
  visualizado: "Visualizado",
  entrevista: "Entrevista",
  rejeitado: "Não seguiu",
  contratado: "Contratado(a)",
};

export function StatusSelect({ applicationId, status }: { applicationId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => updateApplicationStatusAction(applicationId, e.target.value))
      }
      className="rounded-full border border-hub-line bg-white px-2.5 py-1 text-[11.5px] font-bold"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {LABEL[o]}
        </option>
      ))}
    </select>
  );
}
