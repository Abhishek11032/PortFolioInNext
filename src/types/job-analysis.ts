export type EvidenceLevel = "professional_experience" | "project" | "skills_list_only" | "not_found";

export type SkillEvidence = {
  skill: string;
  evidence_level: EvidenceLevel;
  evidence: string;
};

export type ProjectRelevance = {
  project_name: string;
  relevance: string;
  evidence: string;
};

export type JobFitReport = {
  overall_match_score: number;
  summary: string;
  required_skills_matched: string[];
  required_skills_missing: string[];
  preferred_skills_matched: string[];
  preferred_skills_missing: string[];
  relevant_projects: ProjectRelevance[];
  verified_experience: string[];
  strengths: string[];
  skill_gaps: string[];
  interview_recommendations: string[];
  supporting_evidence: string[];
  skill_evidence: SkillEvidence[];
  unverified_or_unconfirmed_skills: string[];
};

type JobAnalysisStatus = "queued" | "processing" | "completed" | "failed";

export type JobAnalysisAccepted = {
  task_id: string;
  access_token: string;
  status: "queued";
};

export type JobAnalysisResult = {
  task_id: string;
  status: JobAnalysisStatus;
  phase?: string | null;
  report?: JobFitReport | null;
  error?: string | null;
};
