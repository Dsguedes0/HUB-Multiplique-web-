import { z } from "zod";

/**
 * Normaliza e valida a URL do site da empresa, garantindo que só esquemas
 * http/https sejam persistidos. Sem essa checagem, um valor como
 * "javascript:..." ficava gravado e era renderizado sem sanitização como
 * `href` do card da empresa em /candidato/empresas e /empresa/empresas —
 * um vetor de XSS armazenado (ver auditoria de código, item #2).
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
