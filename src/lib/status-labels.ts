import type { ApplicationStatus } from "@/types/database";

/** Labels e tons (cor da Tag) por status de candidatura — fonte única. */
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
