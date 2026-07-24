import "server-only";

/**
 * Cooldown contra abuso da cota diária do Gemini free tier, que é
 * compartilhada por todo o projeto. Não substitui um controle de cota real,
 * só evita o abuso mais comum: chamadas repetidas em sequência.
 */
const COOLDOWN_MS = 60_000;

export function checkAiCooldown(lastCallAt: string | null | undefined): string | null {
  if (!lastCallAt) return null;
  const elapsed = Date.now() - new Date(lastCallAt).getTime();
  if (elapsed < COOLDOWN_MS) {
    const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    return `Aguarde mais ${waitSeconds}s antes de chamar a IA novamente.`;
  }
  return null;
}
