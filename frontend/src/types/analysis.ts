/**
 * Analysis Progress Types
 * Defines types for SSE events and progress tracking during analysis
 */

export const AnalysisStatus = {
  UPLOADING: 'uploading',
  ANALYZING_RESUME: 'analyzing_resume',
  ANALYZING_JD: 'analyzing_jd',
  EXTRACTING: 'extracting',
  SCORING: 'scoring',
  ASSESSING_JOB_FIT: 'assessing_job_fit',
  GENERATING_RECOMMENDATIONS: 'generating_recommendations',
  SAVING: 'saving',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export type AnalysisStatusType = typeof AnalysisStatus[keyof typeof AnalysisStatus];

export interface AnalysisProgressEvent {
  status: AnalysisStatusType | string;
  message: string;
  progress: number; // 0-100
  stage: string;
  data?: any; // Final analysis results on complete
}

export interface AnalysisStage {
  id: string;
  status: AnalysisStatusType | string;
  message: string;
  progress: number;
  completed: boolean;
  icon: string; // emoji or icon name
}

export interface AnalysisProgressState {
  currentStatus: AnalysisStatusType | string;
  progress: number;
  message: string;
  stages: AnalysisStage[];
  isComplete: boolean;
  hasError: boolean;
  error?: string;
  analysisResult?: any;
  resumeDbId?: string | null;
  jdDbId?: string | null;
}

export interface LearningResource {
  title: string;
  description: string;
  category: string; // "technical_skills" | "soft_skills" | "certifications"
  resource_type: string; // "course" | "certification" | "tutorial" | "book" | "video"
  url: string;
  estimated_hours: number;
}

export interface CategoryScores {
  skills_match?: number;
  experience_alignment?: number;
  education_and_certifications?: number;
  achievements_and_outcomes?: number;
  soft_skills_and_culture?: number;
  [key: string]: number | undefined;
}

export interface AnalysisResult {
  analysis_id: string;
  overall_score: number;
  fit_classification: 'GOOD_FIT' | 'PARTIAL_FIT' | 'NOT_FIT';
  fit_rationale: string;
  category_scores: CategoryScores;
  recommendations: string[]; // Array of actionable recommendations in second-person voice
  learning_resources: LearningResource[]; // Array of curated resources with real URLs
  progress: number;
  message: string;
}

export interface AnalysisResponse {
  status: string;
  message: string;
  progress: number;
  stage: string;
  data?: AnalysisResult;
}
