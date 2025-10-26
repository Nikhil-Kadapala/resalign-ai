import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { API_ENDPOINTS } from '@/lib/config';
import type { AnalysisProgressState } from '@/types/analysis';

/**
 * Represents the Reducto Upload response from the /upload endpoint
 */
interface Upload {
  file_id: string;
  presigned_url: string | null;
}

interface UploadResponse {
  success: boolean;
  resume_upload: Upload;
  jd_upload: Upload;
  resume_storage_path: string;
  jd_storage_path: string;
}

/**
 * Hook for handling analysis requests with extraction and SSE progress streaming.
 * Process:
 * 1. Call /extract endpoint with upload responses to extract structured data
 * 2. Call /analyze endpoint with extracted data and stream progress via SSE
 */
export const useAnalyzeAPI = () => {
  const [progressState, setProgressState] = useState<AnalysisProgressState>({
    currentStatus: '',
    progress: 0,
    message: '',
    stages: [],
    isComplete: false,
    hasError: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup function for EventSource connection
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  /**
   * Extract structured data from resume and JD.
   * Called before analysis to prepare data.
   */
  const extractData = useCallback(
    async (resumeUpload: UploadResponse, token: string) => {
      try {
        setProgressState((prev) => ({
          ...prev,
          currentStatus: 'extracting',
          progress: 25,
          message: '🔎 Extracting structured data...',
        }));

        const extractResponse = await fetch(API_ENDPOINTS.extract, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            resume_upload: resumeUpload.resume_upload,
            jd_upload: resumeUpload.jd_upload,
            resume_storage_path: resumeUpload.resume_storage_path,
            jd_storage_path: resumeUpload.jd_storage_path,
          }),
        });

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json();
          throw new Error(errorData.detail || 'Extraction failed');
        }

        const extractedData = await extractResponse.json();
        // console.log('Extraction successful:', extractedData);
        
        return extractedData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Extraction failed';
        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Start analysis with SSE progress streaming.
   * First extracts data, then streams progress from /analyze endpoint.
   * 
   * @param resumeUpload - Resume upload response from /upload endpoint (contains both resume and JD)
   */
  const startAnalysis = useCallback(
    async (uploadResponse: UploadResponse) => {
      try {
        setIsLoading(true);
        setError(null);
        setProgressState({
          currentStatus: 'uploading',
          progress: 10,
          message: '🔒 Uploading resume securely. Don\'t worry! You can delete it anytime.',
          stages: [],
          isComplete: false,
          hasError: false,
        });

        // Get current session for authorization
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.access_token) {
          throw new Error('Not authenticated. Please log in again.');
        }

        // Step 1: Extract structured data
        setProgressState((prev) => ({
          ...prev,
          currentStatus: 'finished_uploading',
          progress: 15,
          message: '✅ Finished uploading',
        }));

        const extractedData = await extractData(
          uploadResponse,
          session.access_token
        );

        // Step 2: Start streaming analysis with DB IDs from extraction
        const resumeDbId = extractedData.resume_db_id;
        const jdDbId = extractedData.jd_db_id;
        
        if (!resumeDbId || !jdDbId) {
          throw new Error('Failed to get database IDs from extraction. Please try again.');
        }
        
        // Set timeout for analysis (5 minutes max)
        timeoutRef.current = setTimeout(() => {
          cleanup();
          setError('Analysis taking longer than expected. Please try again.');
          setIsLoading(false);
        }, 5 * 60 * 1000);

        // Use fetch with streaming for secure token handling in Authorization header
        const response = await fetch(API_ENDPOINTS.analyze, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,  // ✅ Secure in header
          },
          body: JSON.stringify({
            resume_db_id: resumeDbId,
            jd_db_id: jdDbId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Analysis request failed: ${response.statusText}`);
        }

        // Read SSE stream from response body
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim();

                if (dataStr === '[DONE]') {
                  // Stream complete
                  cleanup();
                  setIsLoading(false);
                  break;
                }

                try {
                  const event = JSON.parse(dataStr);

                  if (event.event === 'progress') {
                    setProgressState((prev) => ({
                      ...prev,
                      currentStatus: event.data.stage,
                      progress: event.data.progress,
                      message: event.data.message,
                    }));
                  } else if (event.event === 'complete') {
                    setProgressState((prev) => ({
                      ...prev,
                      isComplete: true,
                      analysisResult: event.data,
                    }));
                    cleanup();
                    setIsLoading(false);
                  } else if (event.event === 'error') {
                    throw new Error(event.data.error || event.data.message);
                  }
                } catch (parseErr) {
                  console.error('Error parsing SSE data:', parseErr);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
        setError(errorMessage);
        setProgressState((prev) => ({
          ...prev,
          hasError: true,
          error: errorMessage,
        }));
        setIsLoading(false);
      }
    },
    [cleanup, extractData]
  );

  /**
   * Cancel the analysis and close the SSE connection.
   */
  const cancelAnalysis = useCallback(() => {
    cleanup();
    setIsLoading(false);
    setProgressState((prev) => ({
      ...prev,
      isComplete: true,
      hasError: true,
      error: 'Analysis cancelled by user',
    }));
  }, [cleanup]);

  /**
   * Reset the progress state for a new analysis.
   */
  const reset = useCallback(() => {
    cleanup();
    setProgressState({
      currentStatus: '',
      progress: 0,
      message: '',
      stages: [],
      isComplete: false,
      hasError: false,
    });
    setError(null);
    setIsLoading(false);
  }, [cleanup]);

  return {
    progressState,
    isLoading,
    error,
    startAnalysis,
    cancelAnalysis,
    reset,
  };
};
