import type {
  CandidateExperience,
  CandidateSkill,
  JobRequirement,
  MatchBreakdownItem,
} from "@/types/database";

const WEIGHTS = {
  skills: 45,
  experience: 25,
  education: 15,
  availability: 15,
};

export interface CandidateProfileInput {
  skills: CandidateSkill[];
  experiences: CandidateExperience[];
  education: string | null;
  availability: string | null;
}

export interface MatchResult {
  score: number;
  breakdown: MatchBreakdownItem[];
}

function normalizeSkillName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function scoreSkills(
  candidateSkills: CandidateSkill[],
  requirements: JobRequirement[]
): { value: number; obs: string } {
  if (requirements.length === 0) {
    return { value: 100, obs: "Vaga não especificou requisitos técnicos." };
  }

  const byName = new Map(
    candidateSkills.map((s) => [normalizeSkillName(s.name), s.level])
  );

  let weightedSum = 0;
  let totalWeight = 0;
  const gaps: string[] = [];

  for (const req of requirements) {
    const level = byName.get(normalizeSkillName(req.skill)) ?? 0;
    const ratio = Math.min(level / Math.max(req.level_required, 1), 1);
    weightedSum += ratio * req.weight;
    totalWeight += req.weight;
    if (ratio < 0.6) gaps.push(req.skill);
  }

  const value = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  const obs =
    gaps.length > 0
      ? `${gaps.slice(0, 3).join(", ")} ${gaps.length > 1 ? "ainda estão" : "ainda está"} abaixo do nível pedido`
      : "Nível técnico compatível com os requisitos da vaga";

  return { value, obs };
}

function scoreExperience(
  experiences: CandidateExperience[]
): { value: number; obs: string } {
  const totalMonths = experiences.reduce((acc, e) => acc + (e.months || 0), 0);
  const value = Math.round(Math.min(totalMonths / 24, 1) * 100);
  const obs =
    totalMonths === 0
      ? "Sem experiência formal cadastrada ainda"
      : `${Math.round(totalMonths)} meses de experiência cadastrados`;
  return { value, obs };
}

function scoreEducation(education: string | null): { value: number; obs: string } {
  if (!education || education.trim().length === 0) {
    return { value: 0, obs: "Formação não preenchida no perfil" };
  }
  return { value: 90, obs: "Formação compatível com a vaga" };
}

function scoreAvailability(availability: string | null): { value: number; obs: string } {
  if (!availability) return { value: 50, obs: "Disponibilidade não informada" };
  const normalized = normalizeSkillName(availability);
  if (normalized.includes("imediata")) {
    return { value: 100, obs: "Disponibilidade imediata" };
  }
  return { value: 70, obs: `Disponibilidade: ${availability}` };
}

export function computeMatch(
  candidate: CandidateProfileInput,
  requirements: JobRequirement[]
): MatchResult {
  const skills = scoreSkills(candidate.skills, requirements);
  const experience = scoreExperience(candidate.experiences);
  const education = scoreEducation(candidate.education);
  const availability = scoreAvailability(candidate.availability);

  const score = Math.round(
    (skills.value * WEIGHTS.skills +
      experience.value * WEIGHTS.experience +
      education.value * WEIGHTS.education +
      availability.value * WEIGHTS.availability) /
      100
  );

  const breakdown: MatchBreakdownItem[] = [
    { criterio: "Habilidades técnicas", valor: skills.value, obs: skills.obs },
    { criterio: "Experiência", valor: experience.value, obs: experience.obs },
    { criterio: "Formação", valor: education.value, obs: education.obs },
    { criterio: "Disponibilidade", valor: availability.value, obs: availability.obs },
  ];

  return { score, breakdown };
}
