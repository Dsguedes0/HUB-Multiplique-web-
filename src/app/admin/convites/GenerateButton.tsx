"use client";

import { useTransition } from "react";
import { generateInviteAction } from "./actions";
import { Button } from "@/components/ui";

export function GenerateButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="brand"
      disabled={pending}
      onClick={() => startTransition(() => generateInviteAction(50, 30))}
    >
      {pending ? "Gerando…" : "+ Gerar novo código"}
    </Button>
  );
}
