import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { AnalysisProgressState } from '@/types/analysis';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  progressState: AnalysisProgressState;
  onCancel: () => void;
}

/**
 * Modal component for displaying real-time analysis progress.
 * Shows progress bar, current status, and completed stages.
 */
export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  progressState,
  onCancel,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress bar animation
  useEffect(() => {
    if (progressState.progress > displayProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress(
          Math.min(displayProgress + (progressState.progress - displayProgress) * 0.1 + 1, progressState.progress)
        );
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [progressState.progress, displayProgress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-lg shadow-2xl p-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Resume</h2>
          {!progressState.isComplete && (
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cancel analysis"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        {/* Error State */}
        {progressState.hasError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Analysis Failed</p>
              <p className="text-sm text-red-700 mt-1">{progressState.error}</p>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl animate-bounce">{progressState.message.charAt(0)}</span>
            <p className="text-lg text-gray-700 font-medium">{progressState.message}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(displayProgress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{Math.round(displayProgress)}%</p>
        </div>

        {/* Stage Progress */}
        <div className="mb-6">
          <div className="space-y-2">
            {[
              { label: 'Upload', progress: 15 },
              { label: 'Analyze Resume', progress: 30 },
              { label: 'Analyze Job Description', progress: 45 },
              { label: 'Extract Skills', progress: 60 },
              { label: 'Calculate Score', progress: 75 },
              { label: 'Generate Recommendations', progress: 85 },
              { label: 'Curate Resources', progress: 95 },
            ].map((stage, index) => {
              const isCompleted = progressState.progress > stage.progress;
              const isCurrent =
                progressState.progress >= stage.progress - 10 &&
                progressState.progress < stage.progress + 10;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : isCurrent ? '⚡' : index + 1}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                          ? 'text-blue-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complete State */}
        {progressState.isComplete && !progressState.hasError && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-900 font-medium">✨ Analysis Complete!</p>
            <p className="text-sm text-green-700 mt-1">Redirecting to results...</p>
          </div>
        )}

        {/* Cancel Button (if not complete) */}
        {!progressState.isComplete && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
