
export type UserRole = "admin" | "empresa" | "candidato";
export type CompanyStatus = "pendente" | "ativa" | "inativa";
export type JobStatus = "aberta" | "pausada" | "preenchida";
export type JobModality = "presencial" | "hibrido" | "remoto";
export type JobType = "clt" | "pj" | "estagio" | "temporario";
export type ApplicationStatus =
  | "candidatou"
  | "visualizado"
  | "entrevista"
  | "rejeitado"
  | "contratado";

export interface JobRequirement {
  skill: string;
  weight: number;
  level_required: number;
}

export interface CandidateSkill {
  name: string;
  level: number;
}

export interface CandidateExperience {
  title: string;
  company: string;
  months: number;
  description?: string;
}

export interface MatchBreakdownItem {
  criterio: string;
  valor: number;
  obs: string;
}

export interface TrackItem {
  titulo: string;
  desc: string;
  prioridade: "Alta" | "Média" | "Baixa";
  prazo: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          created_by: string | null;
          max_uses: number;
          uses_count: number;
          expires_at: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invite_codes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["invite_codes"]["Row"]>;
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          cnpj: string | null;
          sector: string | null;
          size: string | null;
          description: string | null;
          city: string | null;
          website: string | null;
          logo_url: string | null;
          status: CompanyStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["companies"]["Row"]> & {
          owner_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string | null;
          requirements: JobRequirement[];
          seniority: string | null;
          type: JobType;
          modality: JobModality;
          salary_range: string | null;
          status: JobStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["jobs"]["Row"]> & {
          company_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Row"]>;
      };
      candidate_profiles: {
        Row: {
          id: string;
          availability: string | null;
          salary_expectation: string | null;
          education: string | null;
          skills: CandidateSkill[];
          experiences: CandidateExperience[];
          cv_url: string | null;
          cv_parsed_at: string | null;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["candidate_profiles"]["Row"]
        > & { id: string };
        Update: Partial<
          Database["public"]["Tables"]["candidate_profiles"]["Row"]
        >;
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          match_score: number | null;
          match_breakdown: MatchBreakdownItem[];
          status: ApplicationStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["applications"]["Row"]> & {
          job_id: string;
          candidate_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Row"]>;
      };
      development_tracks: {
        Row: {
          id: string;
          application_id: string;
          items: TrackItem[];
          ai_model_used: string | null;
          generated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["development_tracks"]["Row"]
        > & { application_id: string };
        Update: Partial<
          Database["public"]["Tables"]["development_tracks"]["Row"]
        >;
      };
    };
  };
}
