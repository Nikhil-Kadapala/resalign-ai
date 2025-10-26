import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { API_ENDPOINTS } from '@/lib/config';

interface Upload {
  file_id: string
  presigned_url: string | null
}

interface UploadResponse {
  success: boolean;
  resume_upload: Upload;
  jd_upload: Upload;
  resume_storage_path: string;
  jd_storage_path: string;
}

/**
 * Hook for uploading resume and job description to backend.
 * Automatically handles authentication via Supabase session token.
 */
export const useUploadAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload resume and JD to backend with authentication.
   * User identity is derived from Supabase JWT token on the backend.
   * 
   * @param resumeFile - PDF resume file
   * @param jdFile - PDF job description file
   * @returns UploadResponse with file_ids
   */
  const uploadResumeAndJD = async (
    resumeFile: File,
    jdFile: File
  ): Promise<UploadResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      // console.log('Session:', session);
      
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // Create FormData for multipart upload (no user_id needed - derived from token)
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('jd_file', jdFile);

      // Send request to backend with Authorization header
      const response = await fetch(API_ENDPOINTS.upload, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: 'Unknown error',
        }));

        throw new Error(
          errorData.detail ||
            `Upload failed with status ${response.status}: ${response.statusText}`
        );
      }

      const data: UploadResponse = await response.json();

      if (!data.success) {
        throw new Error('Upload failed');
      }
      

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Upload failed';

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    clearError,
    uploadResumeAndJD,
  };
};
