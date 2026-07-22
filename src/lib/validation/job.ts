import { z } from "zod";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/status-labels";

export const jobRequirementSchema = z.object({
  skill: z.string().trim().min(1).max(60),
  weight: z.number().int().min(1).max(5),
  level_required: z.number().int().min(0).max(100),
});

export const jobModalitySchema = z.enum(["presencial", "hibrido", "remoto"]);
export const jobTypeSchema = z.enum(["clt", "pj", "estagio", "temporario"]);

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório.").max(160),
  description: z.string().trim().max(4000).optional(),
  seniority: z.string().trim().max(60).optional(),
  type: jobTypeSchema,
  modality: jobModalitySchema,
  requirements: z.array(jobRequirementSchema).max(30),
});

export const applicationStatusSchema = z.enum(APPLICATION_STATUS_OPTIONS);
