"use client";

import { useTransition } from "react";
import { approveCompanyAction } from "./actions";
import { Button } from "@/components/ui";

export function ApproveButton({ companyId }: { companyId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="primary"
      disabled={pending}
      onClick={() => startTransition(() => approveCompanyAction(companyId))}
    >
      {pending ? "Aprovando…" : "Aprovar"}
    </Button>
  );
}
