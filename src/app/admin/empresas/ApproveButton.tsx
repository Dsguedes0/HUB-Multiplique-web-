"use client";

import { useState, useTransition } from "react";
import { approveCompanyAction } from "./actions";
import { Button } from "@/components/ui";

export function ApproveButton({ companyId }: { companyId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="primary"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await approveCompanyAction(companyId);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao aprovar empresa.");
            }
          });
        }}
      >
        {pending ? "Aprovando…" : "Aprovar"}
      </Button>
      {error && <span className="text-[10.5px] font-semibold text-hub-danger">{error}</span>}
    </div>
  );
}
