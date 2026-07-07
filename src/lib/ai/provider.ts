import type {
  CandidateExperience,
  CandidateSkill,
  MatchBreakdownItem,
  TrackItem,
} from "@/types/database";

export interface CvExtraction {
  skills: CandidateSkill[];
  experiences: CandidateExperience[];
  education: string | null;
  availability: string | null;
}

export interface TrackInput {
  jobTitle: string;
  jobRequirements: string[];
  candidateSkills: CandidateSkill[];
  matchBreakdown: MatchBreakdownItem[];
}

export interface AiProvider {
  extractCvData(pdfBase64: string): Promise<CvExtraction>;
  generateDevelopmentTrack(input: TrackInput): Promise<TrackItem[]>;
}

export { geminiProvider as aiProvider } from "./gemini";
