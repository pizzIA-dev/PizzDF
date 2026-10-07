import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export { pdfjsLib };

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Render a single page thumbnail as a data URL
 */
export async function renderPageThumbnail(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 0.35
): Promise<{ url: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (!context) throw new Error('Cannot get canvas context');

  // @ts-ignore
  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }).promise;

  return {
    url: canvas.toDataURL('image/jpeg', 0.8),
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Render high quality page to canvas
 */
export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (!context) throw new Error('Cannot get canvas context');

  // @ts-ignore
  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }).promise;

  return { width: viewport.width, height: viewport.height };
}

/**
 * Merge multiple PDF ArrayBuffers into one
 */
export async function mergePDFs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Organize, reorder, rotate and filter PDF pages
 */
export async function organizePDF(
  sourceBytes: ArrayBuffer,
  pageConfigs: { originalIndex: number; rotation: number }[]
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const outputPdf = await PDFDocument.create();

  const originalIndices = pageConfigs.map(p => p.originalIndex);
  const copiedPages = await outputPdf.copyPages(sourcePdf, originalIndices);

  copiedPages.forEach((page, i) => {
    const desiredRotation = pageConfigs[i].rotation;
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + desiredRotation) % 360));
    outputPdf.addPage(page);
  });

  return await outputPdf.save();
}

/**
 * Split PDF into selected pages or ranges
 */
export async function extractPDFPages(
  sourceBytes: ArrayBuffer,
  pageIndicesToExtract: number[]
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const outputPdf = await PDFDocument.create();

  const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndicesToExtract);
  copiedPages.forEach(page => outputPdf.addPage(page));

  return await outputPdf.save();
}

/**
 * Add customizable watermark to all pages
 */
export async function addWatermark(
  sourceBytes: ArrayBuffer,
  text: string,
  options: {
    opacity?: number;
    size?: number;
    angle?: number;
    colorHex?: string;
  } = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const opacity = options.opacity ?? 0.3;
  const size = options.size ?? 50;
  const angle = options.angle ?? 45;

  // Convert hex to rgb
  const hex = (options.colorHex || '#ef4444').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);

    page.drawText(text, {
      x: width / 2 - (textWidth / 2) * Math.cos((angle * Math.PI) / 180),
      y: height / 2 - (textHeight / 2) * Math.sin((angle * Math.PI) / 180),
      size,
      font,
      color: rgb(r, g, b),
      rotate: degrees(angle),
      opacity,
    });
  }

  return await pdfDoc.save();
}

/**
 * Add page numbering (e.g. Page 1 of 10)
 */
export async function addPageNumbers(
  sourceBytes: ArrayBuffer,
  options: {
    format: 'simple' | 'pageOfTotal' | 'folio';
    position: 'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left';
    fontSize?: number;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;
  const fontSize = options.fontSize ?? 10;

  pages.forEach((page, index) => {
    const pageNum = index + 1;
    let text = `${pageNum}`;
    if (options.format === 'pageOfTotal') {
      text = `Página ${pageNum} de ${total}`;
    } else if (options.format === 'folio') {
      text = `Folio: ${String(pageNum).padStart(4, '0')}`;
    }

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x = width / 2 - textWidth / 2;
    let y = 20;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 30;
      y = 20;
    } else if (options.position === 'bottom-left') {
      x = 30;
      y = 20;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 30;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdfDoc.save();
}

/**
 * Compress PDF by rendering pages to compressed images and reconstructing
 */
export async function compressPdf(
  sourceBytes: ArrayBuffer,
  level: 'light' | 'medium' | 'extreme',
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const pdfJsDoc = await pdfjsLib.getDocument({ data: sourceBytes.slice(0) }).promise;
  const totalPages = pdfJsDoc.numPages;

  const qualityMap = {
    light: { scale: 1.5, quality: 0.8 },
    medium: { scale: 1.2, quality: 0.6 },
    extreme: { scale: 0.9, quality: 0.4 },
  };

  const { scale, quality } = qualityMap[level];
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // @ts-ignore
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
      const jpegImage = await newPdf.embedJpg(jpegDataUrl);
      
      const newPage = newPdf.addPage([viewport.width / scale, viewport.height / scale]);
      newPage.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width: viewport.width / scale,
        height: viewport.height / scale,
      });
    }

    if (onProgress) {
      onProgress(Math.round((i / totalPages) * 100));
    }
  }

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Convert images into a single PDF
 */
export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const buffer = await file.arrayBuffer();
    let embeddedImg;

    if (file.type.includes('png')) {
      embeddedImg = await pdfDoc.embedPng(buffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(buffer);
    }

    const imgDims = embeddedImg.scale(1);
    const page = pdfDoc.addPage([imgDims.width, imgDims.height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: imgDims.width,
      height: imgDims.height,
    });
  }

  return await pdfDoc.save();
}
