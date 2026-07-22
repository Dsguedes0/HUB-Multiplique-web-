import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Nome da habilidade é obrigatório.").max(60),
  level: z.number().int().min(0).max(100),
});

export const experienceSchema = z.object({
  title: z.string().trim().max(120),
  company: z.string().trim().max(120),
  months: z.number().int().min(0).max(600),
  description: z.string().trim().max(500).optional(),
});

export const profilePayloadSchema = z.object({
  fullName: z.string().trim().min(1, "Informe seu nome.").max(120),
  availability: z.string().trim().max(60),
  salaryExpectation: z.string().trim().max(60),
  education: z.string().trim().max(200),
  skills: z.array(skillSchema).max(30),
  experiences: z.array(experienceSchema).max(30),
});

export type ProfilePayloadInput = z.infer<typeof profilePayloadSchema>;
