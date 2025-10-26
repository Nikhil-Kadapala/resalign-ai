import { useState } from 'react';

interface UrlVerificationResult {
  isSafe: boolean;
  isDangerous: boolean;
  error: string | null;
  threatTypes?: string[];
}

interface FetchContentResult {
  success: boolean;
  content: string | null;
  error: string | null;
}

/**
 * Hook for verifying URL safety and fetching job description content.
 * Uses Google Safe Browsing API for threat detection.
 */
export const useUrlVerification = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Verify URL safety using Google Safe Browsing API.
   * @param url - The URL to verify
   * @returns UrlVerificationResult with safety status and threats if any
   */
  const verifyUrlSafety = async (url: string): Promise<UrlVerificationResult> => {
    try {
      setIsLoading(true);

      const apiKey = import.meta.env.VITE_LOOKUP_API_KEY;
      if (!apiKey) {
        throw new Error('Safe Browsing API key not configured');
      }

      const requestBody = {
        client: {
          clientId: 'alignai',
          clientVersion: '1.0.0',
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION',
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      };

      const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: Try again, if the problem persists, please copy and paste the description under Raw Text.`);
      }

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        const threatTypes = data.matches.map(
          (match: { threatType: string; platformType: string }) => `${match.threatType} on ${match.platformType}`
        );

        return {
          isSafe: false,
          isDangerous: true,
          error: null,
          threatTypes,
        };
      }

      return {
        isSafe: true,
        isDangerous: false,
        error: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'URL verification failed';

      return {
        isSafe: false,
        isDangerous: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch job description content from a URL.
   * Extracts plain text from HTML.
   * @param url - The URL to fetch from
   * @returns FetchContentResult with extracted text or error
   */
  const fetchUrlContent = async (url: string): Promise<FetchContentResult> => {
    try {
      setIsLoading(true);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();

      // Remove script and style tags
      const plainText = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        // Remove HTML tags
        .replace(/<\/?[^>]+(>|$)/g, ' ')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();

      if (!plainText) {
        throw new Error('No text content could be extracted from URL');
      }

      // Limit to first 3000 characters (reasonable JD length)
      const limitedContent = plainText.slice(0, 3000);

      return {
        success: true,
        content: limitedContent,
        error: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch content from URL';

      return {
        success: false,
        content: null,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete flow: Verify URL safety then fetch content if safe.
   * @param url - The URL to process
   * @returns Combined result with safety status and content
   */
  const processJobDescriptionUrl = async (
    url: string
  ): Promise<{ success: boolean; content: string | null; error: string | null }> => {
    try {
      // Validate URL format
      new URL(url);
    } catch {
      return {
        success: false,
        content: null,
        error: 'Invalid URL format',
      };
    }

    // Step 1: Verify safety
    const safetyResult = await verifyUrlSafety(url);

    if (!safetyResult.isSafe) {
      const threatMessage = safetyResult.isDangerous
        ? `This URL is flagged as dangerous: ${safetyResult.threatTypes?.join(', ')}`
        : safetyResult.error || 'URL verification failed';

      return {
        success: false,
        content: null,
        error: threatMessage,
      };
    }

    // Step 2: Fetch content if safe
    const contentResult = await fetchUrlContent(url);

    return {
      success: contentResult.success,
      content: contentResult.content,
      error: contentResult.error,
    };
  };

  return {
    isLoading,
    verifyUrlSafety,
    fetchUrlContent,
    processJobDescriptionUrl,
  };
};
