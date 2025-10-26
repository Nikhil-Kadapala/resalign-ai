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
  RECOMMENDING: 'recommending',
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
}

export interface AnalysisResponse {
  status: string;
  message: string;
  progress: number;
  stage: string;
  data?: {
    skill_match_score?: number;
    missing_skills?: string[];
    recommendations?: string[];
    learning_resources?: string[];
    experience_alignment?: string;
    [key: string]: any;
  };
}
