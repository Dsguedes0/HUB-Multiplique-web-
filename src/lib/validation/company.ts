import { z } from "zod";

/**
 * Aceita só esquemas http/https. Sem essa checagem, um valor como
 * "javascript:..." era persistido e renderizado sem sanitização no `href`
 * do card da empresa — um vetor de XSS armazenado.
 */
export function sanitizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const companyPayloadSchema = z.object({
  name: z.string().trim().min(1, "Nome da empresa é obrigatório.").max(160),
  cnpj: z.string().trim().max(30).nullable(),
  sector: z.string().trim().max(80).nullable(),
  size: z.string().trim().max(80).nullable(),
  city: z.string().trim().max(120).nullable(),
  description: z.string().trim().max(4000).nullable(),
});
