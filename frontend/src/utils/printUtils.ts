// src/utils/printUtils.ts

export interface PrintOptions {
  orientation?: "landscape" | "portrait";
  paperSize?: string;
  scale?: number; // e.g. 0.8 or 80 for 80%
  margin?: string;
  customStyles?: string;
}

/**
 * Prints a specific section of the document by loading its content into a hidden iframe.
 * This ensures that only the desired content is printed, avoiding issues with `window.print()`
 * printing the entire document or encountering CSS conflicts.
 *
 * @param elementId The ID of the HTML element to be printed.
 * @param title Optional title for the print job.
 * @param options Optional print settings including orientation, scale (e.g. 0.8 for 80%), and page margins.
 */
export const printSection = (
  elementId: string,
  title: string = document.title,
  options?: PrintOptions
) => {
  const printContent = document.getElementById(elementId);

  if (!printContent) {
    console.error(`Element with ID "${elementId}" not found for printing.`);
    return;
  }

  // Create a new hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.left = "-9999px";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error("Could not get iframe document.");
    document.body.removeChild(iframe);
    return;
  }

  const orientation = options?.orientation ?? "landscape";
  const paperSize = options?.paperSize ? `${options.paperSize} ` : "";
  const scale = options?.scale
    ? options.scale > 1
      ? options.scale / 100
      : options.scale
    : undefined;
  const margin = options?.margin ?? "8mm 12mm";

  const printSpecificStyles = `
    <style>
      @page {
        size: ${paperSize}${orientation};
        margin: ${margin};
      }
      @media print {
        html, body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          ${scale !== undefined ? `zoom: ${scale} !important;` : ""}
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print\\:hidden, .screen-only, [data-no-print] {
          display: none !important;
        }
      }
      ${scale !== undefined ? `body { zoom: ${scale}; }` : ""}
      ${options?.customStyles || ""}
    </style>
  `;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${document.head.innerHTML}
        ${printSpecificStyles}
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  const handlePrint = () => {
    try {
      iframe.contentWindow?.focus(); // Focus the iframe window
      iframe.contentWindow?.print(); // Trigger print dialog
    } catch (e) {
      console.error("Error during iframe printing:", e);
    } finally {
      // Remove the iframe after a short delay to allow print dialog to appear/be dismissed
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  };

  // Wait a short moment to ensure iframe styles and DOM are fully applied
  setTimeout(handlePrint, 300);
};
