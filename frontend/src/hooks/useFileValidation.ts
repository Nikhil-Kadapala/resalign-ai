/**
 * Hook for file validation with PDF-only support and size limits.
 */
export const useFileValidation = () => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_TYPES = ['application/pdf'];
  const ALLOWED_EXTENSIONS = ['.pdf'];

  /**
   * Validate a resume file.
   * @param file - File to validate
   * @returns Object with isValid flag and error message if invalid
   */
  const validateFile = (
    file: File
  ): { isValid: boolean; error: string | null } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Only PDF files are allowed. Received: ${file.type || 'unknown'}`,
      };
    }

    // Check file extension as additional safety
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Invalid file extension. Only .pdf files are allowed.`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        error: `File is too large (${sizeMB}MB). Maximum allowed size is 5MB.`,
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty. Please select a valid PDF resume.',
      };
    }

    return {
      isValid: true,
      error: null,
    };
  };

  /**
   * Get formatted file size for display.
   * @param bytes - File size in bytes
   * @returns Formatted size string
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return {
    validateFile,
    formatFileSize,
    MAX_FILE_SIZE,
    ALLOWED_TYPES,
    ALLOWED_EXTENSIONS,
  };
};
