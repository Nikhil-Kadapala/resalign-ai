import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timestamp() {
  /**
   * Generate a compact, filesystem-safe timestamp for file versioning.
   * Format: YYYYMMDDTHHMMSSZ (e.g., 20251023T230639Z)
   *
   * Features:
   * - No colons or other problematic characters (filesystem-safe)
   * - UTC timezone (Z suffix indicates UTC)
   * - Sortable chronologically
   * - Used for analysis session versioning to create immutable file triplets
   *
   * Usage:
   * - Resume files: `{sanitized-name}_{timestamp}.pdf`
   * - JD files: `jd_{timestamp}.pdf`
   * - Report files: `report_{timestamp}.pdf`
   *
   * File versioning strategy:
   * Each analysis creates a complete triplet (resume, JD, report) with the same timestamp,
   * enabling users to revisit any historical analysis session.
   *
   * @returns Compact timestamp string (e.g., "20251023T230639Z")
   */

  const now = new Date();
  // Format: 20251023T230639Z (compact, filesystem-safe, UTC timezone)
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function sanitizeFilename(filename: string): string {
  /**
   * Sanitize a filename to remove problematic characters for cross-platform compatibility.
   *
   * Removes:
   * - Windows reserved characters: < > : " / \ | ? *
   * - Control characters (0x00-0x1F)
   * - Leading/trailing dots
   *
   * Replaces:
   * - Whitespace sequences with underscores
   *
   * Example:
   * - Input: "John Doe's Resume (2024).pdf"
   * - Output: "John_Does_Resume_2024"
   *
   * @param filename - The original filename (including extension)
   * @returns Sanitized filename base (without extension)
   */
  
  // Remove file extension to process base name
  const withoutExt = filename.replace(/\.[^/.]+$/, "");

  // Remove/replace problematic characters
  // Remove: < > : " / \ | ? * and control characters
  // Replace spaces with underscores
  const problematicChars = new Set([
    "<",
    ">",
    ":",
    '"',
    "/",
    "\\",
    "|",
    "?",
    "*",
  ]);

  let sanitized = withoutExt
    .split("") // Split into characters
    .filter((char) => {
      const code = char.charCodeAt(0);
      // Keep if code >= 0x20 (not a control character) and not a problematic char
      return code >= 0x20 && !problematicChars.has(char);
    })
    .join("")
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.+$/, "") // Remove trailing dots
    .trim();

  // Fallback if result is empty
  if (!sanitized) {
    sanitized = "document";
  }

  return sanitized;
}