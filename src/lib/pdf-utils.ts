import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Set the PDF.js workerSrc
const pdfjsWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  dataUrl?: string;
}

export interface PDFDocumentInfo {
  pageCount: number;
  title?: string;
  author?: string;
  pages: PDFPageInfo[];
}

export const loadPDF = async (file: File): Promise<PDFDocumentInfo> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    const pageCount = pdfDocument.numPages;
    const metadata = {
      title: file.name,
      author: "Sintu Kumar",
    };

    try {
      const metadataObj = await pdfDocument.getMetadata();
      if (metadataObj.info) {
        // Use proper type checking to avoid TS errors
        const info = metadataObj.info as Record<string, any>;
        metadata.title = info.Title || file.name;
        metadata.author = info.Author || "Unknown";
      }
    } catch (error) {
      console.error("Error getting PDF metadata:", error);
    }

    const pages: PDFPageInfo[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDocument.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });

      pages.push({
        pageNumber: i,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return {
      pageCount,
      title: metadata.title,
      author: metadata.author,
      pages,
    };
  } catch (error) {
    console.error("Error loading PDF:", error);
    toast.error("Failed to load PDF. Please try again.");
    throw new Error("Failed to load PDF");
  }
};

export const renderPageToCanvas = async (
  canvas: HTMLCanvasElement,
  pdfDocument: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1.0
): Promise<void> => {
  try {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context not available");

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error(`Error rendering page ${pageNumber}:`, error);
    throw error;
  }
};

export const generatePageThumbnail = async (
  pdfDocument: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  width: number = 150
): Promise<string> => {
  try {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = width / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context not available");

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    return canvas.toDataURL();
  } catch (error) {
    console.error(`Error generating thumbnail for page ${pageNumber}:`, error);
    return "";
  }
};

export interface PDFTextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  options: {
    fontSize: number;
    fontFamily: string;
    color: string;
    bold: boolean;
    italic: boolean;
  };
}

export interface PDFImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const generateEditedPDF = async (
  originalPdfFile: File,
  textElements: PDFTextElement[],
  imageElements: PDFImageElement[]
): Promise<Blob> => {
  try {
    // Load the original PDF
    const arrayBuffer = await originalPdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // For each page, render the edited content onto it
    for (let i = 0; i < pages.length; i++) {
      const pageIndex = i;
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      // Get elements for this page (in a real implementation, you'd filter by page)
      const pageTextElements = textElements.filter(() => true);
      const pageImageElements = imageElements.filter(() => true);

      // Process text elements
      for (const textElement of pageTextElements) {
        const { text, x, y, options } = textElement;

        // Font settings
        const fontSize = options.fontSize;

        // In pdf-lib, we need to use StandardFonts enum
        let fontName: StandardFonts;

        // Map font family to StandardFonts
        if (
          options.fontFamily.includes("Times") ||
          options.fontFamily.includes("Roman")
        ) {
          fontName = options.bold
            ? options.italic
              ? StandardFonts.TimesRomanBold
              : StandardFonts.TimesRoman
            : options.italic
            ? StandardFonts.TimesRomanItalic
            : StandardFonts.TimesRoman;
        } else if (options.fontFamily.includes("Courier")) {
          fontName = options.bold
            ? options.italic
              ? StandardFonts.CourierBold
              : StandardFonts.Courier
            : options.italic
            ? StandardFonts.CourierOblique
            : StandardFonts.Courier;
        } else {
          // Default to Helvetica
          fontName = options.bold
            ? options.italic
              ? StandardFonts.HelveticaBold
              : StandardFonts.HelveticaBold
            : options.italic
            ? StandardFonts.HelveticaOblique
            : StandardFonts.Helvetica;
        }

        // Embed the font
        const font = await pdfDoc.embedFont(fontName);

        // Convert hex color to RGB
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255,
              }
            : { r: 0, g: 0, b: 0 };
        };

        const color = hexToRgb(options.color);

        // PDF coordinate system starts from the bottom left
        // We need to convert from top-left coordinates to bottom-left
        const pdfY = height - y - fontSize; // Adjust for font height

        page.drawText(text, {
          x,
          y: pdfY,
          size: fontSize,
          font: font,
          color: rgb(color.r, color.g, color.b),
        });
      }

      // Process image elements
      for (const imageElement of pageImageElements) {
        try {
          // Get image data from src
          const response = await fetch(imageElement.src);
          const imageBytes = await response.arrayBuffer();

          // Embed the image
          let pdfImage;
          if (imageElement.src.includes("image/png")) {
            pdfImage = await pdfDoc.embedPng(imageBytes);
          } else {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          }

          // Original dimensions from the editor
          const editorWidth = imageElement.width;
          const editorHeight = imageElement.height;

          // Position the image exactly where it was in the editor
          // Convert from top-left (web) to bottom-left (PDF) coordinate system
          // This is the key fix: we use the exact same x-coordinate, and calculate y
          // based on the page height and the element's y position
          const pdfY = height - imageElement.y - editorHeight;

          // Draw the image on the page with the same dimensions as in the editor
          page.drawImage(pdfImage, {
            x: imageElement.x,
            y: Math.max(0, pdfY), // Ensure y is not negative
            width: editorWidth,
            height: editorHeight,
          });
        } catch (error) {
          console.error("Error embedding image:", error);
          // Continue with other elements if one fails
        }
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("Error generating edited PDF:", error);
    toast.error("Failed to generate PDF with edits");
    throw error;
  }
};
