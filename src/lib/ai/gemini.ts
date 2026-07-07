import "server-only";
import type { AiProvider, CvExtraction, TrackInput } from "./provider";
import type { TrackItem } from "@/types/database";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Gere uma chave grátis em https://aistudio.google.com/apikey e coloque no .env.local"
    );
  }
  return key;
}

async function callGemini(body: unknown) {
  const res = await fetch(
    `${API_BASE}/${MODEL}:generateContent?key=${apiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Resposta vazia da Gemini API");
  return JSON.parse(text);
}

const CV_SCHEMA = {
  type: "object",
  properties: {
    education: { type: "string" },
    availability: { type: "string" },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          level: { type: "number" },
        },
        required: ["name", "level"],
      },
    },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          months: { type: "number" },
          description: { type: "string" },
        },
        required: ["title", "company", "months"],
      },
    },
  },
  required: ["skills", "experiences"],
};

const TRACK_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      titulo: { type: "string" },
      desc: { type: "string" },
      prioridade: { type: "string", enum: ["Alta", "Média", "Baixa"] },
      prazo: { type: "string" },
    },
    required: ["titulo", "desc", "prioridade", "prazo"],
  },
};

async function extractCvData(pdfBase64: string): Promise<CvExtraction> {
  const result = await callGemini({
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
          {
            text:
              "Leia este currículo em português e extraia, em JSON: habilidades " +
              "técnicas com nível estimado de 0 a 100 (skills), experiências " +
              "profissionais com duração em meses (experiences), formação " +
              "(education, texto curto) e disponibilidade (availability, texto " +
              "curto: ex. 'Imediata'). Se não souber algo, deixe vazio — não invente.",
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: CV_SCHEMA,
    },
  });

  return {
    skills: result.skills ?? [],
    experiences: result.experiences ?? [],
    education: result.education ?? null,
    availability: result.availability ?? null,
  };
}

async function generateDevelopmentTrack(input: TrackInput): Promise<TrackItem[]> {
  const prompt = `Você é um mentor de carreira do Hub Multiplique, uma comunidade
que conecta pessoas a vagas em empresas parceiras. Um candidato quer a vaga
"${input.jobTitle}", que pede: ${input.jobRequirements.join(", ") || "não especificado"}.

Perfil atual do candidato (skills e nível 0-100): ${JSON.stringify(input.candidateSkills)}.

Resultado da régua de match por critério: ${JSON.stringify(input.matchBreakdown)}.

Gere de 3 a 5 passos práticos e concretos (cursos gratuitos ou baratos,
projetos para portfólio, certificações, práticas) para o candidato aumentar
sua aderência a essa vaga especificamente. Responda em português do Brasil,
em JSON, cada item com: titulo, desc (1-2 frases), prioridade (Alta/Média/Baixa)
e prazo (texto curto, ex: "2 semanas").`;

  const result = await callGemini({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: TRACK_SCHEMA,
    },
  });

  return Array.isArray(result) ? result : [];
}

export const geminiProvider: AiProvider = {
  extractCvData,
  generateDevelopmentTrack,
};
