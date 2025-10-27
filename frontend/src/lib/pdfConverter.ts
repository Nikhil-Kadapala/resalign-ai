import { jsPDF } from 'jspdf';

/**
 * Convert text content to a PDF file
 * @param textContent - The text content to convert to PDF
 * @param filename - Optional filename for the PDF
 * @returns Promise<File> - The generated PDF as a File object
 */
export async function textToPdfFile(
  textContent: string,
  filename: string = 'document.pdf'
): Promise<File> {
  try {
    // Create new PDF document
    const doc = new jsPDF();

    // Set up font and margins
    doc.setFontSize(12);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(textContent, maxWidth);

    // Add text to PDF with pagination
    let yPosition = margin;
    const lineHeight = 7; // Height of each line
    const linesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

    lines.forEach((line: string, index: number) => {
      // Check if we need a new page
      if (index > 0 && index % linesPerPage === 0) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Get PDF as blob
    const pdfBlob = doc.output('blob');

    // Convert blob to File object
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    return file;
  } catch (error) {
    console.error('Error converting text to PDF:', error);
    throw new Error(`Failed to convert text to PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}
