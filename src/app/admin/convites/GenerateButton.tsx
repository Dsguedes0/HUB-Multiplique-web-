"use client";

import { useState, useTransition } from "react";
import { generateInviteAction } from "./actions";
import { Button } from "@/components/ui";

export function GenerateButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="brand"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await generateInviteAction(50, 30);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao gerar convite.");
            }
          });
        }}
      >
        {pending ? "Gerando…" : "+ Gerar novo código"}
      </Button>
      {error && <span className="text-[10.5px] font-semibold text-hub-danger">{error}</span>}
    </div>
  );
}
