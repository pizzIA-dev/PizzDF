import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileEdit, 
  Type, 
  PenTool, 
  Highlighter, 
  Stamp, 
  Edit3, 
  Image as ImageIcon,
  Table as TableIcon, 
  Download, 
  Undo, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  MousePointer, 
  PanelLeftClose, 
  PanelLeft,
  Sliders,
  Sparkles
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { SignatureModal } from '../common/SignatureModal';
import { StampModal, type StampData } from '../common/StampModal';
import { ClearAnnotationsModal } from '../common/ClearAnnotationsModal';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { PDFPageView } from './PDFPageView';
import { pdfjsLib, renderPageThumbnail, downloadBlob } from '../../utils/pdfHelper';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type ActiveTool = 'select' | 'text' | 'draw' | 'highlight' | 'table' | 'stamp';

export interface TableData {
  rows: number;
  cols: number;
  cells: string[][];
  borderColor?: string;
  textColor?: string;
  headerBg?: string;
}

export interface PageAnnotation {
  id: string;
  type: 'text' | 'draw' | 'stamp' | 'image' | 'signature' | 'table' | 'highlight';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  points?: { x: number; y: number }[];
  strokeWidth?: number;
  opacity?: number;
  stampLabel?: string;
  imageData?: string;
  tableData?: TableData;
}

export const EditorTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [scale, setScale] = useState(1.15);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showThumbnailsSidebar, setShowThumbnailsSidebar] = useState(true);

  // Active Tool
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');

  // Pen tool settings (Color libre & Grosor libre)
  const [penColor, setPenColor] = useState('#dc2626');
  const [penWidth, setPenWidth] = useState(3);

  // Highlighter settings (Color libre & Grosor libre)
  const [highlighterColor, setHighlighterColor] = useState('#facc15');
  const [highlighterWidth, setHighlighterWidth] = useState(24);

  // Modals & Notifications
  const [showStampModal, setShowStampModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [currentPageInView, setCurrentPageInView] = useState(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Annotations state
  const [annotations, setAnnotations] = useState<PageAnnotation[]>([]);
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
  // Selected Stamp Preset for continuous click-and-stamp mode
  const [selectedStampPreset, setSelectedStampPreset] = useState<StampData | null>(null);

  // In-app Clipboard for copying and pasting elements
  const [copiedAnnotation, setCopiedAnnotation] = useState<PageAnnotation | null>(null);

  // Container refs
  const scrollViewerRef = useRef<HTMLDivElement | null>(null);
  const pageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

    // Copy / Paste handlers
  const handleCopy = (ann: PageAnnotation) => {
    setCopiedAnnotation(ann);
    addToast('info', 'Elemento copiado al portapapeles. Presiona Ctrl+V para pegar.');
  };

  const handlePaste = () => {
    if (!copiedAnnotation) {
      addToast('info', 'No hay ningún elemento en el portapapeles para pegar.');
      return;
    }
    const targetPageIndex = Math.max(0, currentPageInView - 1);
    const pastedAnn: PageAnnotation = {
      ...copiedAnnotation,
      id: `ann-${Date.now()}-${Math.random()}`,
      pageIndex: targetPageIndex,
      x: Math.min(0.85, copiedAnnotation.x + 0.04),
      y: Math.min(0.85, copiedAnnotation.y + 0.04),
      zIndex: (copiedAnnotation.zIndex || 15) + 1,
    };
    handleAddAnnotation(pastedAnn);
    setSelectedAnnId(pastedAnn.id);
    addToast('success', 'Elemento duplicado y pegado');
  };

  useEffect(() => {
    const handleCopyPasteKeys = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditingText = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      if (isEditingText) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedAnnId) {
          const selected = annotations.find(a => a.id === selectedAnnId);
          if (selected) {
            e.preventDefault();
            handleCopy(selected);
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (copiedAnnotation) {
          e.preventDefault();
          handlePaste();
        }
      }
    };

    window.addEventListener('keydown', handleCopyPasteKeys);
    return () => window.removeEventListener('keydown', handleCopyPasteKeys);
  }, [selectedAnnId, copiedAnnotation, annotations, currentPageInView]);

  // Keyboard shortcut listener: SUPR / Delete removes selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Del') {
        const activeEl = document.activeElement;
        const isEditingText = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          (activeEl as HTMLElement).isContentEditable
        );

        if (!isEditingText && selectedAnnId) {
          e.preventDefault();
          handleDeleteAnnotation(selectedAnnId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnId]);


  const addToast = (type: 'error' | 'success' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);

      const doc = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      setPdfDocProxy(doc);
      setNumPages(doc.numPages);
      setAnnotations([]);
      setSelectedAnnId(null);

      const thumbs: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const thumb = await renderPageThumbnail(doc, i, 0.25);
        thumbs.push(thumb.url);
      }
      setThumbnails(thumbs);
      addToast('success', `Documento cargado (${doc.numPages} páginas)`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al leer el archivo PDF.');
    } finally {
      setLoading(false);
    }
  };

  // Annotation management
  const handleAddAnnotation = (ann: PageAnnotation) => {
    setAnnotations(prev => [...prev, ann]);
  };

  const handleUpdateAnnotation = (updated: PageAnnotation) => {
    setAnnotations(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedAnnId === id) setSelectedAnnId(null);
    addToast('info', 'Elemento eliminado');
  };

      // Stamp Selected from StampModal (activates click-and-stamp mode)
  const handleStampChosen = (stamp: StampData) => {
    setSelectedStampPreset(stamp);
    setActiveTool('stamp');
    addToast('success', `Sello «${stamp.label}» listo: haz clic donde quieras ponerlo.`);
  };

  // Signature Saved
  const handleSignatureSaved = (dataUrl: string) => {
    const newAnn: PageAnnotation = {
      id: `ann-${Date.now()}-${Math.random()}`,
      type: 'signature',
      pageIndex: Math.max(0, currentPageInView - 1),
      x: 0.35,
      y: 0.75,
      width: 0.28,
      height: 0.12,
      zIndex: 20,
      imageData: dataUrl,
    };
    handleAddAnnotation(newAnn);
    setSelectedAnnId(newAnn.id);
    addToast('success', 'Firma lista. Arrástrala para moverla o cambia su tamaño.');
  };

  // Image Uploaded
  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAnn: PageAnnotation = {
        id: `ann-${Date.now()}-${Math.random()}`,
        type: 'image',
        pageIndex: 0,
        x: 0.35,
        y: 0.35,
        width: 0.25,
        height: 0.25,
        zIndex: 15,
        imageData: dataUrl,
      };
      handleAddAnnotation(newAnn);
      setSelectedAnnId(newAnn.id);
      addToast('success', 'Imagen insertada');
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const handleUndo = () => {
    if (annotations.length === 0) return;
    setAnnotations(prev => prev.slice(0, -1));
    addToast('info', 'Deshecho');
  };

    // Clear choices: Current page vs All pages
  const handleClearCurrentPage = () => {
    const pageIdx = Math.max(0, currentPageInView - 1);
    setAnnotations(prev => prev.filter(a => a.pageIndex !== pageIdx));
    setSelectedAnnId(null);
    addToast('info', `Anotaciones de la Página ${pageIdx + 1} eliminadas`);
  };

  const handleClearAllPages = () => {
    setAnnotations([]);
    setSelectedAnnId(null);
    addToast('info', 'Quitaste todo lo que habías agregado.');
  };

  // Scroll smoothly to a specific page inside the container ONLY (without jumping the page)
  const scrollToPage = (pageIndex: number) => {
    setCurrentPageInView(pageIndex + 1);
    const scrollContainer = scrollViewerRef.current;
    const targetPageEl = pageContainerRefs.current[pageIndex];

    if (scrollContainer && targetPageEl) {
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const pageTop = targetPageEl.getBoundingClientRect().top;
      const relativeOffset = pageTop - containerTop + scrollContainer.scrollTop - 15;

      scrollContainer.scrollTo({
        top: relativeOffset,
        behavior: 'smooth',
      });
    }
  };

  // Track which page is currently in view during scroll
  const handleScroll = () => {
    const scrollContainer = scrollViewerRef.current;
    if (!scrollContainer) return;
    const containerTop = scrollContainer.getBoundingClientRect().top;

    for (let i = 0; i < pageContainerRefs.current.length; i++) {
      const el = pageContainerRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > containerTop + 100) {
          setCurrentPageInView(i + 1);
          break;
        }
      }
    }
  };

  // Export PDF with annotations embedded using pdf-lib
  const handleExportPDF = async () => {
    if (!fileBuffer) {
      addToast('error', 'No hay ningún archivo cargado para exportar.');
      return;
    }
    setSaving(true);

    try {
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);

      // Sort annotations by zIndex so visual layer order is preserved exactly
      const sortedAnnotations = [...annotations].sort((a, b) => (a.zIndex || 10) - (b.zIndex || 10));

      for (const ann of sortedAnnotations) {
        if (ann.pageIndex < 0 || ann.pageIndex >= pages.length) continue;
        const page = pages[ann.pageIndex];
        const { width: pWidth, height: pHeight } = page.getSize();

        // Convert normalized (0..1) coordinates into exact PDF points (origin at bottom-left in PDF)
        const pdfX = ann.x * pWidth;
        const pdfY = pHeight - (ann.y * pHeight);
        const pdfW = (ann.width || 0.25) * pWidth;
        const pdfH = (ann.height || 0.1) * pHeight;

        try {
          if (ann.type === 'text' && ann.text && ann.text.trim()) {
            // Render text onto high-DPI offscreen canvas for 100% WYSIWYG matching with editor
            const tCanvas = document.createElement('canvas');
            const dpr = 3; // Ultra sharp 3x resolution
            const cW = Math.max(80, Math.round(pdfW * dpr));
            const cH = Math.max(40, Math.round(pdfH * dpr));
            tCanvas.width = cW;
            tCanvas.height = cH;
            const tCtx = tCanvas.getContext('2d');

            if (tCtx) {
              const fontSizePx = (ann.fontSize || 18) * dpr;
              const fontWeight = ann.isBold ? 'bold' : 'normal';
              const fontStyle = ann.isItalic ? 'italic' : 'normal';
              const fontFamily = ann.fontFamily || "'Inter', sans-serif";
              
              tCtx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;
              tCtx.fillStyle = ann.color || '#000000';
              tCtx.textBaseline = 'top';

              const lines = ann.text.split('\n');
              const lineHeightPx = fontSizePx * 1.25;

              lines.forEach((line, lIdx) => {
                const yPos = lIdx * lineHeightPx + 4 * dpr;
                tCtx.fillText(line, 4 * dpr, yPos);

                if (ann.isUnderline) {
                  const textMetrics = tCtx.measureText(line);
                  tCtx.fillRect(4 * dpr, yPos + fontSizePx, textMetrics.width, 2 * dpr);
                }
              });

              const textPngUrl = tCanvas.toDataURL('image/png');
              const textRes = await fetch(textPngUrl);
              const textBytes = await textRes.arrayBuffer();
              const textPng = await pdfDoc.embedPng(textBytes);

              page.drawImage(textPng, {
                x: pdfX,
                y: pdfY - pdfH,
                width: pdfW,
                height: pdfH,
              });
            }
          } else if ((ann.type === 'signature' || ann.type === 'image') && ann.imageData) {
            try {
              // Convert any data URL (PNG, WebP, JPEG) to pure PNG bytes using an offscreen canvas
              const img = new Image();
              img.crossOrigin = 'anonymous';
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (e) => reject(e);
                img.src = ann.imageData!;
              });

              const offCanvas = document.createElement('canvas');
              offCanvas.width = img.naturalWidth || img.width || 400;
              offCanvas.height = img.naturalHeight || img.height || 400;
              const ctx = offCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                const pngDataUrl = offCanvas.toDataURL('image/png');
                const pngRes = await fetch(pngDataUrl);
                const pngBytes = await pngRes.arrayBuffer();
                const embeddedImg = await pdfDoc.embedPng(pngBytes);

                page.drawImage(embeddedImg, {
                  x: pdfX,
                  y: pdfY - pdfH,
                  width: pdfW,
                  height: pdfH,
                });
              }
            } catch (imgErr) {
              console.warn('Could not embed image/signature annotation:', imgErr);
            }
          } else if (ann.type === 'highlight' && ann.points && ann.points.length > 0) {
            // High-fidelity Highlighter: Render offscreen canvas and embed as translucent PNG!
            const highCanvas = document.createElement('canvas');
            const cWidth = Math.max(50, Math.round(pdfW * 2));
            const cHeight = Math.max(50, Math.round(pdfH * 2));
            highCanvas.width = cWidth;
            highCanvas.height = cHeight;
            const hCtx = highCanvas.getContext('2d');
            if (hCtx) {
              hCtx.strokeStyle = ann.color || '#facc15';
              hCtx.lineWidth = Math.max(4, (ann.strokeWidth || 32) * 2);
              hCtx.lineCap = 'round';
              hCtx.lineJoin = 'round';
              hCtx.beginPath();
              ann.points.forEach((p, pIdx) => {
                const px = p.x * cWidth;
                const py = p.y * cHeight;
                if (pIdx === 0) hCtx.moveTo(px, py);
                else hCtx.lineTo(px, py);
              });
              hCtx.stroke();

              const highPngUrl = highCanvas.toDataURL('image/png');
              const highRes = await fetch(highPngUrl);
              const highBytes = await highRes.arrayBuffer();
              const highPng = await pdfDoc.embedPng(highBytes);

              page.drawImage(highPng, {
                x: pdfX,
                y: pdfY - pdfH,
                width: pdfW,
                height: pdfH,
                opacity: 0.38,
              });
            }
          } else if (ann.type === 'draw' && ann.points && ann.points.length > 0) {
            // High-fidelity Pen: Render offscreen canvas and embed as sharp PNG!
            const drawCanvas = document.createElement('canvas');
            const cWidth = Math.max(50, Math.round(pdfW * 2));
            const cHeight = Math.max(50, Math.round(pdfH * 2));
            drawCanvas.width = cWidth;
            drawCanvas.height = cHeight;
            const dCtx = drawCanvas.getContext('2d');
            if (dCtx) {
              dCtx.strokeStyle = ann.color || '#dc2626';
              dCtx.lineWidth = Math.max(2, (ann.strokeWidth || 4) * 2);
              dCtx.lineCap = 'round';
              dCtx.lineJoin = 'round';
              dCtx.beginPath();
              ann.points.forEach((p, pIdx) => {
                const px = p.x * cWidth;
                const py = p.y * cHeight;
                if (pIdx === 0) dCtx.moveTo(px, py);
                else dCtx.lineTo(px, py);
              });
              dCtx.stroke();

              const drawPngUrl = drawCanvas.toDataURL('image/png');
              const drawRes = await fetch(drawPngUrl);
              const drawBytes = await drawRes.arrayBuffer();
              const drawPng = await pdfDoc.embedPng(drawBytes);

              page.drawImage(drawPng, {
                x: pdfX,
                y: pdfY - pdfH,
                width: pdfW,
                height: pdfH,
              });
            }
          } else if (ann.type === 'stamp') {
            // High-fidelity Stamp matching UI design exactly
            const stampCanvas = document.createElement('canvas');
            stampCanvas.width = 400;
            stampCanvas.height = 120;
            const sCtx = stampCanvas.getContext('2d');
            if (sCtx) {
              const hex = ann.color || '#dc2626';
              const sW = Math.max(100, Math.round(pdfW * 2));
              const sH = Math.max(40, Math.round(pdfH * 2));
              stampCanvas.width = sW;
              stampCanvas.height = sH;

              sCtx.fillStyle = hex + '22';
              sCtx.strokeStyle = hex;
              sCtx.lineWidth = Math.max(3, sH * 0.06);
              sCtx.beginPath();
              const radius = Math.min(20, sH * 0.25);
              sCtx.roundRect(sCtx.lineWidth, sCtx.lineWidth, sW - sCtx.lineWidth * 2, sH - sCtx.lineWidth * 2, radius);
              sCtx.fill();
              sCtx.stroke();

              // Calculate proportional font size
              const stampFontSize = Math.round(Math.min(sW * 0.12, sH * 0.45));
              sCtx.fillStyle = hex;
              sCtx.font = `900 ${stampFontSize}px Inter, Arial, sans-serif`;
              sCtx.textAlign = 'center';
              sCtx.textBaseline = 'middle';
              sCtx.fillText((ann.stampLabel || 'BORRADOR').toUpperCase(), sW / 2, sH / 2);

              const stampPngUrl = stampCanvas.toDataURL('image/png');
              const stampRes = await fetch(stampPngUrl);
              const stampBytes = await stampRes.arrayBuffer();
              const stampPng = await pdfDoc.embedPng(stampBytes);

              page.drawImage(stampPng, {
                x: pdfX,
                y: pdfY - pdfH,
                width: pdfW,
                height: pdfH,
              });
            }
          } else if (ann.type === 'table' && ann.tableData && ann.tableData.cells) {
            const cells = ann.tableData.cells;
            const rows = cells.length;
            const cols = cells[0]?.length || 1;
            const cellW = pdfW / cols;
            const cellH = pdfH / Math.max(1, rows);

            const hexBorder = (ann.tableData.borderColor || '#94a3b8').replace('#', '');
            const br = parseInt(hexBorder.substring(0, 2), 16) / 255 || 0.6;
            const bg = parseInt(hexBorder.substring(2, 4), 16) / 255 || 0.6;
            const bb = parseInt(hexBorder.substring(4, 6), 16) / 255 || 0.6;

            for (let rIdx = 0; rIdx < rows; rIdx++) {
              for (let cIdx = 0; cIdx < cols; cIdx++) {
                const cellX = pdfX + cIdx * cellW;
                const cellY = pdfY - (rIdx + 1) * cellH;

                page.drawRectangle({
                  x: cellX,
                  y: cellY,
                  width: cellW,
                  height: cellH,
                  borderColor: rgb(br, bg, bb),
                  borderWidth: 1,
                  color: rIdx === 0 ? rgb(0.1, 0.15, 0.25) : rgb(1, 1, 1),
                });

                const textStr = (cells[rIdx]?.[cIdx] || '').replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
                if (textStr) {
                  const fontSize = Math.min(10, Math.max(6, cellH * 0.4));
                  page.drawText(textStr, {
                    x: cellX + 4,
                    y: cellY + cellH / 2 - fontSize / 2,
                    size: fontSize,
                    font: rIdx === 0 ? helveticaBold : helvetica,
                    color: rIdx === 0 ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
                  });
                }
              }
            }
          }
        } catch (itemErr) {
          console.warn('Error rendering specific annotation to PDF:', itemErr);
        }
      }

      const finalPdfBytes = await pdfDoc.save();
      const blob = new Blob([finalPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const originalName = file?.name?.replace('.pdf', '') || 'documento';
      downloadBlob(blob, `${originalName}_editado.pdf`);
      addToast('success', 'Listo, tu PDF se descargó.');
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      addToast('error', 'No se pudo guardar: ' + (err?.message || 'revisa lo que agregaste.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-[var(--tomato)]" />
              Editar
            </h2>
            <p className="text-xs text-slate-600">
              Haz clic sobre el documento para escribir, dibujar o firmar. Todo lo que agregues se puede mover después.
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFile(null);
                setFileBuffer(null);
                setPdfDocProxy(null);
                setThumbnails([]);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cambiar Archivo
            </button>

            <button
              onClick={handleExportPDF}
              disabled={saving}
              className="btn-primary-sharp px-5 py-2.5 text-xs flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Guardar y Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div className="py-12">
          <FileDropzone
            onFilesSelected={handleFileSelected}
            title="Abre el PDF que quieres editar"
            subtitle="Escribe encima, firma, estampa sellos, dibuja o inserta imágenes y tablas."
          />
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 text-xs font-semibold">Abriendo el documento…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Studio Floating Toolbar */}
          <div className="bg-white/95 border border-slate-200 faceted-cut p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md sticky top-20 z-40">
            {/* Primary Tool Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setShowThumbnailsSidebar(s => !s)}
                className={`p-2 rounded-lg text-xs font-bold transition ${
                  showThumbnailsSidebar ? 'bg-amber-400 text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Mostrar/Ocultar miniaturas laterales"
              >
                {showThumbnailsSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <button
                onClick={() => { setActiveTool('select'); setSelectedStampPreset(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTool === 'select' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Navegar / Seleccionar</span>
              </button>

              <button
                onClick={() => { setActiveTool('text'); setSelectedStampPreset(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTool === 'text' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Texto</span>
              </button>
              <button
                onClick={() => { setActiveTool('table'); setSelectedStampPreset(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTool === 'table' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
                title="Insertar Tabla Editable estilo Excel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>


              <button
                onClick={() => { setActiveTool('draw'); setSelectedStampPreset(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTool === 'draw' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Lápiz</span>
              </button>

              <button
                onClick={() => { setActiveTool('highlight'); setSelectedStampPreset(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTool === 'highlight' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Resaltador</span>
              </button>

                            {/* Stamps Picker Button */}
              <button
                onClick={() => setShowStampModal(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTool === 'stamp' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
                title="Elegir sello para estampar con cada clic"
              >
                <Stamp className="w-3.5 h-3.5 text-orange-400" />
                <span>Sellos</span>
              </button>

              {/* Signature */}
              <button
                onClick={() => { setShowSignatureModal(true); setSelectedStampPreset(null); setActiveTool('select'); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-950 flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Firmar</span>
              </button>

              {/* Insert Image */}
              <button
                onClick={() => { fileInputRef.current?.click(); setSelectedStampPreset(null); setActiveTool('select'); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-950 flex items-center gap-1.5 transition"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Imagen</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUploaded}
                className="hidden"
              />
            </div>

            {/* Context Tool Modifiers (Pen & Highlighter with free sliders & numbers) */}
            {activeTool === 'draw' && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 text-xs text-slate-700">
                {/* Free color picker */}
                <label className="flex items-center gap-1 cursor-pointer" title="Color libre de tinta">
                  <span className="text-[10px] text-slate-600 font-semibold">Color:</span>
                  <input
                    type="color"
                    value={penColor}
                    onChange={e => setPenColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <div className="h-3 w-px bg-slate-300 mx-1" />

                {/* Free thickness slider + number */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 font-semibold">Grosor:</span>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={penWidth}
                    onChange={e => setPenWidth(Number(e.target.value))}
                    className="w-20 accent-amber-400"
                  />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={penWidth}
                    onChange={e => setPenWidth(Number(e.target.value))}
                    className="w-10 bg-white border border-slate-300 rounded px-1 text-center text-xs font-mono font-bold text-amber-700 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-600 font-semibold">px</span>
                </div>
              </div>
            )}

            {activeTool === 'highlight' && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 text-xs text-slate-700">
                {/* Free highlighter color */}
                <label className="flex items-center gap-1 cursor-pointer" title="Color de resaltador">
                  <span className="text-[10px] text-slate-600 font-semibold">Color:</span>
                  <input
                    type="color"
                    value={highlighterColor}
                    onChange={e => setHighlighterColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <div className="h-3 w-px bg-slate-300 mx-1" />

                {/* Free highlighter width slider + number */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 font-semibold">Grosor:</span>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={highlighterWidth}
                    onChange={e => setHighlighterWidth(Number(e.target.value))}
                    className="w-20 accent-amber-400"
                  />
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={highlighterWidth}
                    onChange={e => setHighlighterWidth(Number(e.target.value))}
                    className="w-10 bg-white border border-slate-300 rounded px-1 text-center text-xs font-mono font-bold text-amber-700 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-600 font-semibold">px</span>
                </div>
              </div>
            )}

            {/* Undo, Clear, Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={annotations.length === 0}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-30 transition"
                title="Deshacer última anotación"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowClearModal(true)}
                disabled={annotations.length === 0}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-30 transition"
                title="Limpiar todas las anotaciones"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs border border-slate-200 text-slate-700">
                <button
                  onClick={() => setScale(s => Math.max(0.6, s - 0.15))}
                  className="p-1 hover:text-amber-600 text-slate-600"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-800 font-mono text-[11px] min-w-[40px] text-center font-bold">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
                  className="p-1 hover:text-amber-600 text-slate-600"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Tool Help Banner */}
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs text-amber-900 flex items-center justify-between font-medium shadow-sm">
            <span>
              {activeTool === 'select' && 'Haz clic en un elemento para moverlo, cambiar su tamaño, fuente o color, o mandarlo al frente o al fondo.'}
              {activeTool === 'text' && 'Haz clic donde quieras escribir.'}
              {activeTool === 'draw' && 'Dibuja a mano alzada. Al soltar, el trazo queda como un elemento que puedes mover.'}
              {activeTool === 'highlight' && 'Pasa el cursor sobre el texto para resaltarlo.'}
            </span>
            <span className="text-amber-700 font-mono text-[11px] font-semibold">{numPages} páginas cargadas</span>
          </div>

          {/* Main Viewer & Scroll Area */}
          <div className="flex gap-4 items-start">
            
            {/* Left Page Thumbnails Sidebar */}
            {showThumbnailsSidebar && (
              <div className="w-48 bg-white border border-slate-200 faceted-cut p-3 shrink-0 max-h-[calc(100vh-220px)] overflow-y-auto space-y-3 sticky top-36 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 pb-1 border-b border-slate-200">
                  Páginas ({numPages})
                </div>
                <div className="space-y-2">
                  {thumbnails.map((thumbUrl, idx) => {
                    const pageAnns = annotations.filter(a => a.pageIndex === idx);
                    const isCurrent = currentPageInView === idx + 1;
                    return (
                      <div
                        key={idx}
                        onClick={() => scrollToPage(idx)}
                        className={`group cursor-pointer p-2 rounded-xl border transition flex flex-col items-center gap-1.5 shadow ${
                          isCurrent 
                            ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400/50' 
                            : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-slate-100'
                        }`}
                      >
                        {/* Perfect-fit page wrapper: No white border bars, exactly bounds the PDF page */}
                        <div className="relative inline-block overflow-hidden rounded shadow-md border border-slate-700/60 bg-white">
                          <img
                            src={thumbUrl}
                            alt={`Página ${idx + 1}`}
                            className="max-h-[140px] w-auto block select-none pointer-events-none"
                          />
                          {/* Live representation of annotations aligned precisely with the page */}
                          {pageAnns.map(a => (
                            <div
                              key={a.id}
                              className="absolute pointer-events-none rounded-[1px]"
                              style={{
                                left: `${a.x * 100}%`,
                                top: `${a.y * 100}%`,
                                width: `${Math.max(4, (a.width || 0.25) * 100)}%`,
                                height: `${Math.max(3, (a.height || 0.1) * 100)}%`,
                                backgroundColor: a.type === 'highlight' 
                                  ? (a.color || '#facc15') 
                                  : a.type === 'stamp' 
                                    ? (a.color || '#dc2626') 
                                    : a.type === 'draw'
                                      ? (a.color || '#dc2626')
                                      : a.type === 'image'
                                        ? '#3b82f6'
                                        : '#f59e0b',
                                opacity: a.type === 'highlight' ? 0.45 : 0.75,
                                border: '1px solid rgba(0,0,0,0.5)',
                              }}
                            />
                          ))}
                          {pageAnns.length > 0 && (
                            <span className="absolute top-1 right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-md">
                              {pageAnns.length}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide ${isCurrent ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`}>
                          Página {idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continuous Scroll Viewport Container */}
            <div
              ref={scrollViewerRef}
              onScroll={handleScroll}
              className="flex-1 bg-slate-200 border border-slate-300 rounded-2xl p-6 max-h-[calc(100vh-220px)] overflow-y-auto space-y-8 shadow-inner flex flex-col items-center"
            >
              {Array.from({ length: numPages }).map((_, pageIdx) => (
                <PDFPageView
                  key={pageIdx}
                  pageNumber={pageIdx + 1}
                  pdfDoc={pdfDocProxy}
                  scale={scale}
                  annotations={annotations}
                  selectedAnnId={selectedAnnId}
                  onSelectAnn={setSelectedAnnId}
                  onUpdateAnn={handleUpdateAnnotation}
                  onDeleteAnn={handleDeleteAnnotation}
                  onAddAnnotation={handleAddAnnotation}
                  onCopyAnn={handleCopy}
                  selectedStampPreset={selectedStampPreset}
                  activeTool={activeTool}
                  penColor={penColor}
                  penWidth={penWidth}
                  highlighterColor={`${highlighterColor}70`}
                  highlighterWidth={highlighterWidth}
                  containerRefCallback={el => {
                    pageContainerRefs.current[pageIdx] = el;
                  }}
                />
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignatureSaved}
      />

      {/* Stamp Picker Modal */}
      <StampModal
        isOpen={showStampModal}
        onClose={() => setShowStampModal(false)}
        onSelectStamp={handleStampChosen}
      />

      {/* Clear Annotations Modal */}
      <ClearAnnotationsModal
        isOpen={showClearModal}
        currentPage={currentPageInView}
        onClose={() => setShowClearModal(false)}
        onClearCurrentPage={handleClearCurrentPage}
        onClearAllPages={handleClearAllPages}
      />

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
