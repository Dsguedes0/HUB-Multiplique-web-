"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function EmpresaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-hub-line bg-white p-6 text-center">
      <div className="mb-2 text-[15px] font-extrabold">Não foi possível carregar esta página</div>
      <p className="mb-4 text-[13px] text-hub-muted-2">{error.message || "Tente novamente."}</p>
      <Button type="button" variant="primary" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
