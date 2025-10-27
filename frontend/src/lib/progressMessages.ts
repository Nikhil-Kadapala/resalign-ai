/**
 * Progress Messages and Stage Configuration
 * Maps backend status codes to user-friendly messages with progress percentages
 */

export interface ProgressStageConfig {
  id: string;
  status: string;
  message: string;
  icon: string;
  progress: number;
}

export const PROGRESS_STAGES: Record<string, ProgressStageConfig> = {
  uploading: {
    id: 'uploading',
    status: 'Uploading',
    message: '🔒 Uploading resume securely. Don\'t worry! You can delete it anytime.',
    icon: '⬆️',
    progress: 10,
  },
  upload_complete: {
    id: 'upload_complete',
    status: 'Upload Complete',
    message: '✅ Finished uploading',
    icon: '✓',
    progress: 15,
  },
  analyzing_resume: {
    id: 'analyzing_resume',
    status: 'Analyzing Resume',
    message: '🔍 Analyzing your resume...',
    icon: '🔍',
    progress: 30,
  },
  analyzing_jd: {
    id: 'analyzing_jd',
    status: 'Analyzing Job Description',
    message: '📋 Analyzing job description...',
    icon: '📋',
    progress: 45,
  },
  extracting: {
    id: 'extracting',
    status: 'Extracting Skills',
    message: '🔎 Extracting skills and experience...',
    icon: '🔎',
    progress: 60,
  },
  scoring: {
    id: 'scoring',
    status: 'Calculating Score',
    message: '📊 Calculating match score...',
    icon: '📊',
    progress: 75,
  },
  recommending: {
    id: 'recommending',
    status: 'Generating Recommendations',
    message: '💡 Generating recommendations...',
    icon: '💡',
    progress: 85,
  },
  curating: {
    id: 'curating',
    status: 'Curating Resources',
    message: '📚 Curating learning resources...',
    icon: '📚',
    progress: 95,
  },
  complete: {
    id: 'complete',
    status: 'Complete',
    message: '✨ Analysis complete!',
    icon: '✨',
    progress: 100,
  },
};

export function getStageConfig(status: string): ProgressStageConfig {
  // Map various status names to our stages
  const statusMap: Record<string, string> = {
    uploading: 'uploading',
    finished_uploading: 'upload_complete',
    analyzing_resume: 'analyzing_resume',
    analyzing_jd: 'analyzing_jd',
    extracting: 'extracting',
    scoring: 'scoring',
    recommending: 'recommending',
    curating: 'curating',
    complete: 'complete',
  };

  const stageId = statusMap[status] || status;
  return PROGRESS_STAGES[stageId] || PROGRESS_STAGES.analyzing_resume;
}

export function getProgressMessage(status: string): string {
  return getStageConfig(status).message;
}

export function getProgressPercentage(status: string): number {
  return getStageConfig(status).progress;
}
