import "server-only";

/**
 * Guarda simples de frequência para as duas Server Actions que chamam a API
 * do Gemini (extração de currículo e geração de trilha). O free tier do
 * Gemini Flash tem cota diária compartilhada por todo o projeto — sem
 * nenhum limite por usuário, uma única conta poderia esgotá-la sozinha e
 * derrubar a funcionalidade de IA para toda a comunidade (ver auditoria de
 * código, item #6). Isso não substitui um controle de cota mais robusto
 * (ex.: contador diário global), mas evita o caso mais comum de abuso:
 * chamadas repetidas em sequência.
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
