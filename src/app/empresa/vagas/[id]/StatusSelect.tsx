"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatusAction } from "../actions";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_OPTIONS } from "@/lib/status-labels";

export function StatusSelect({ applicationId, status }: { applicationId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          startTransition(async () => {
            try {
              await updateApplicationStatusAction(applicationId, next);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao atualizar status.");
            }
          });
        }}
        className="rounded-full border border-hub-line bg-white px-2.5 py-1 text-[11.5px] font-bold"
      >
        {APPLICATION_STATUS_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {APPLICATION_STATUS_LABEL[o]}
          </option>
        ))}
      </select>
      {error && <span className="text-[10.5px] font-semibold text-hub-danger">{error}</span>}
    </div>
  );
}
