// src/utils/printUtils.ts

/**
 * Prints a specific section of the document by loading its content into a hidden iframe.
 * This ensures that only the desired content is printed, avoiding issues with `window.print()`
 * printing the entire document or encountering CSS conflicts.
 *
 * @param elementId The ID of the HTML element to be printed.
 * @param title Optional title for the print job.
 */
export const printSection = (elementId: string, title: string = document.title) => {
  const printContent = document.getElementById(elementId);

  if (!printContent) {
    console.error(`Element with ID "${elementId}" not found for printing.`);
    return;
  }

  // Create a new hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.left = '-9999px';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('Could not get iframe document.');
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${document.head.innerHTML}
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus(); // Focus the iframe window
      iframe.contentWindow?.print(); // Trigger print dialog
    } catch (e) {
      console.error("Error during iframe printing:", e);
    } finally {
      // Remove the iframe after a short delay to allow print dialog to appear/be dismissed
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500); // 500ms should be enough for the print dialog to open
    }
  };
};
