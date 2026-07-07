"use client";

import { useActionState } from "react";
import { generateTrackAction, type TrackState } from "./actions";
import { Card, Tag, Button } from "@/components/ui";
import type { TrackItem } from "@/types/database";

export function TrilhaClient({
  jobId,
  applicationId,
  initialItems,
}: {
  jobId: string;
  applicationId: string;
  initialItems: TrackItem[] | null;
}) {
  const boundAction = generateTrackAction.bind(null, jobId, applicationId);
  const initialState: TrackState = { items: initialItems ?? undefined };
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const items = state.items ?? [];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#17171a] to-[#2a2a2f] px-5.5 py-5 text-white">
        <div>
          <b className="text-[15px]">
            <span className="anim-pulse inline-block text-hub-red-light">✦</span> Assistente de IA — Hub Multiplique
          </b>
          <p className="mt-1 text-[12.5px] text-[#c9c9cf]">
            Analisa seu perfil x a vaga e sugere um plano prático para melhorar seu match.
          </p>
        </div>
        <form action={formAction}>
          <Button type="submit" variant="brand" disabled={pending}>
            {pending ? "Gerando…" : items.length > 0 ? "↻ Gerar novamente" : "✨ Gerar trilha com IA"}
          </Button>
        </form>
      </div>

      <Card>
        {pending && (
          <div className="flex items-center gap-2.5 py-4 text-[13px] font-semibold text-hub-muted-2">
            <span className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-hub-line border-t-hub-red" />
            Gerando trilha personalizada com IA…
          </div>
        )}

        {!pending && state.error && (
          <div className="py-3 text-[13px] font-semibold text-hub-danger">
            {state.error}
            {state.error.includes("GEMINI_API_KEY") && (
              <div className="mt-1 font-normal text-hub-muted-2">
                Configure sua chave gratuita do Gemini no arquivo .env.local (veja o README).
              </div>
            )}
          </div>
        )}

        {!pending && !state.error && items.length === 0 && (
          <div className="py-4 text-sm text-hub-muted">
            Ainda não geramos uma trilha para essa vaga. Clique em &ldquo;Gerar trilha com IA&rdquo;.
          </div>
        )}

        {!pending &&
          items.map((item, i) => (
            <div
              key={i}
              className="flex gap-3.5 border-b border-hub-line py-3.5 transition-[padding] duration-200 last:border-none hover:pl-1.5"
            >
              <div className="mt-0.5 flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full border-2 border-[#ddd9d0] text-[11px]" />
              <div>
                <div className="mb-0.5 text-sm font-bold">{item.titulo}</div>
                <div className="mb-1.5 text-[12.5px] text-hub-muted-2">{item.desc}</div>
                <div className="flex gap-1.5">
                  <Tag tone={item.prioridade === "Alta" ? "red" : "amber"}>
                    Prioridade {item.prioridade}
                  </Tag>
                  <Tag>Prazo sugerido: {item.prazo}</Tag>
                </div>
              </div>
            </div>
          ))}
      </Card>
    </>
  );
}
