import type { ApplicationStatus } from "@/types/database";

/**
 * Labels e "tons" (cores de Tag) para o status de uma candidatura. Fonte
 * única — antes duplicada entre a tela do candidato e a do StatusSelect da
 * empresa (ver auditoria de código, item #17).
 */
export const APPLICATION_STATUS_OPTIONS = [
  "candidatou",
  "visualizado",
  "entrevista",
  "rejeitado",
  "contratado",
] as const satisfies ApplicationStatus[];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  candidatou: "Em análise",
  visualizado: "Visualizado pela empresa",
  entrevista: "Entrevista",
  rejeitado: "Não seguiu",
  contratado: "Contratado(a)",
};

export const APPLICATION_STATUS_TONE: Record<
  ApplicationStatus,
  "amber" | "green" | "red" | "neutral"
> = {
  candidatou: "amber",
  visualizado: "amber",
  entrevista: "green",
  rejeitado: "red",
  contratado: "green",
};
