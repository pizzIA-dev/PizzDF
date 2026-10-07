import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Scissors, 
  Download, 
  RefreshCw, 
  Archive, 
  FileCheck, 
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { pdfjsLib, renderPageThumbnail, extractPDFPages, downloadBlob, formatFileSize } from '../../utils/pdfHelper';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

export const SplitTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]); // 1-based
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);
  const gridContainerRef = React.useRef<HTMLDivElement | null>(null);
  const dragStartPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const initialSelectionRef = React.useRef<number[]>([]);
  const hasMovedRef = React.useRef(false);
  const [splitMode, setSplitMode] = useState<'extract' | 'all-individual'>('extract');
  const [rangeInput, setRangeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);

      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      const numPages = pdf.numPages;
      const thumbs: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const thumb = await renderPageThumbnail(pdf, i, 0.35);
        thumbs.push(thumb.url);
      }

      setThumbnails(thumbs);
      setSelectedPages([1]);
      setRangeInput('1');
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al procesar el PDF para dividir.');
    } finally {
      setLoading(false);
    }
  };

  // Smart selection with Shift (range) and Ctrl/Cmd (multi-toggle)
  const handlePageClick = (pageNum: number, e: React.MouseEvent) => {
    // If the mouse was dragged for marquee selection, ignore the single click
    if (hasMovedRef.current) return;

    if (splitMode !== 'extract') {
      setSplitMode('extract');
    }

    if (e.shiftKey && lastClickedIndex !== null) {
      // Range selection
      const start = Math.min(lastClickedIndex, pageNum);
      const end = Math.max(lastClickedIndex, pageNum);
      const rangeNums: number[] = [];
      for (let i = start; i <= end; i++) rangeNums.push(i);

      setSelectedPages(prev => {
        const set = new Set(e.ctrlKey || e.metaKey ? prev : []);
        rangeNums.forEach(n => set.add(n));
        const next = Array.from(set).sort((a, b) => a - b);
        setRangeInput(next.join(', '));
        return next;
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle single page
      setSelectedPages(prev => {
        const next = prev.includes(pageNum)
          ? prev.filter(p => p !== pageNum)
          : [...prev, pageNum].sort((a, b) => a - b);
        setRangeInput(next.join(', '));
        return next;
      });
      setLastClickedIndex(pageNum);
    } else {
      // Simple click: select single or deselect if already alone
      setSelectedPages(prev => {
        const next = prev.includes(pageNum) && prev.length === 1 ? [] : [pageNum];
        setRangeInput(next.join(', '));
        return next;
      });
      setLastClickedIndex(pageNum);
    }
  };

  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore interactive controls
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }

    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      initialSelectionRef.current = [...selectedPages];
    } else {
      const isOverCard = !!(e.target as HTMLElement).closest('[data-page-num]');
      if (!isOverCard) {
        // Clicking empty space in the grid clears selection
        setSelectedPages([]);
        setRangeInput('');
        initialSelectionRef.current = [];
      } else {
        initialSelectionRef.current = [];
      }
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartPosRef.current || !gridContainerRef.current) return;

      const dist = Math.hypot(e.clientX - dragStartPosRef.current.x, e.clientY - dragStartPosRef.current.y);
      if (!hasMovedRef.current && dist > 5) {
        hasMovedRef.current = true;
        setIsMarqueeSelecting(true);
        setMarqueeStart(dragStartPosRef.current);
      }

      if (!hasMovedRef.current) return;

      setMarqueeCurrent({ x: e.clientX, y: e.clientY });

      const start = dragStartPosRef.current;
      const x1 = Math.min(start.x, e.clientX);
      const y1 = Math.min(start.y, e.clientY);
      const x2 = Math.max(start.x, e.clientX);
      const y2 = Math.max(start.y, e.clientY);

      const cardEls = gridContainerRef.current.querySelectorAll('[data-page-num]');
      const intersected = new Set<number>(initialSelectionRef.current);

      cardEls.forEach(card => {
        const rect = card.getBoundingClientRect();
        const intersects = !(rect.right < x1 || rect.left > x2 || rect.bottom < y1 || rect.top > y2);
        if (intersects) {
          const num = Number(card.getAttribute('data-page-num'));
          if (num) intersected.add(num);
        }
      });

      const next = Array.from(intersected).sort((a, b) => a - b);
      setSelectedPages(next);
      setRangeInput(next.join(', '));
      if (splitMode !== 'extract') {
        setSplitMode('extract');
      }
    };

    const handleMouseUp = () => {
      dragStartPosRef.current = null;
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeCurrent(null);
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [splitMode, selectedPages]);

  const togglePage = (pageNum: number) => {
    setSelectedPages(prev => {
      const next = prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b);
      setRangeInput(next.join(', '));
      return next;
    });
  };

  const handleSelectEven = () => {
    const evens = thumbnails.map((_, i) => i + 1).filter(p => p % 2 === 0);
    setSelectedPages(evens);
    setRangeInput(evens.join(', '));
  };

  const handleSelectOdd = () => {
    const odds = thumbnails.map((_, i) => i + 1).filter(p => p % 2 !== 0);
    setSelectedPages(odds);
    setRangeInput(odds.join(', '));
  };

  const handleSelectAll = () => {
    const all = thumbnails.map((_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(all.join(', '));
  };

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    const pageSet = new Set<number>();

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
            if (p >= 1 && p <= thumbnails.length) pageSet.add(p);
          }
        }
      } else {
        const p = Number(part);
        if (!isNaN(p) && p >= 1 && p <= thumbnails.length) {
          pageSet.add(p);
        }
      }
    }

    setSelectedPages(Array.from(pageSet).sort((a, b) => a - b));
  };

  const handleExecuteSplit = async () => {
    if (!fileBuffer) return;
    setProcessing(true);

    try {
      const originalName = file?.name?.replace('.pdf', '') || 'documento';

      if (splitMode === 'extract') {
        if (selectedPages.length === 0) {
          addToast('error', 'Por favor selecciona al menos una página para extraer.');
          return;
        }

        const indices = selectedPages.map(p => p - 1);
        const extractedBytes = await extractPDFPages(fileBuffer, indices);
        const blob = new Blob([extractedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
        downloadBlob(blob, `${originalName}_paginas_extraidas.pdf`);
      } else {
        // Individual pages into a ZIP
        const zip = new JSZip();
        const srcPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const total = srcPdf.getPageCount();

        for (let i = 0; i < total; i++) {
          const singleDoc = await PDFDocument.create();
          const [copied] = await singleDoc.copyPages(srcPdf, [i]);
          singleDoc.addPage(copied);
          const singleBytes = await singleDoc.save();
          zip.file(`${originalName}_pagina_${i + 1}.pdf`, singleBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${originalName}_todas_las_paginas.zip`);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al separar las páginas del PDF.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Scissors className="w-6 h-6 text-purple-400" />
              Dividir y Separar PDF
            </h2>
            <p className="text-xs text-slate-600">
              Extrae páginas seleccionadas a un nuevo documento o separa cada página en archivos individuales.
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFile(null);
                setFileBuffer(null);
                setThumbnails([]);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cambiar Archivo
            </button>

            <button
              onClick={handleExecuteSplit}
              disabled={processing || (splitMode === 'extract' && selectedPages.length === 0)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : splitMode === 'extract' ? (
                <>
                  <Download className="w-4 h-4" />
                  <span>Extraer ({selectedPages.length} págs)</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Descargar Todo en ZIP</span>
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
            title="Sube el PDF que deseas dividir"
            subtitle="Podrás seleccionar rangos de páginas o extraer todas por separado"
          />
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 text-sm font-medium">Cargando páginas del documento...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Options Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-900">Modo de división:</span>
              <button
                onClick={() => setSplitMode('extract')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  splitMode === 'extract'
                    ? 'bg-purple-500 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Extraer páginas seleccionadas
              </button>
              <button
                onClick={() => setSplitMode('all-individual')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  splitMode === 'all-individual'
                    ? 'bg-purple-500 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Separar cada página en un PDF (.ZIP)
              </button>
            </div>

            {splitMode === 'extract' && (
              <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-slate-200">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">Rango de páginas:</span>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="Ej. 1-3, 5, 8"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 w-48 focus:border-purple-500 focus:outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition font-semibold"
                  >
                    Todas ({thumbnails.length})
                  </button>
                  <button
                    onClick={handleSelectOdd}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition font-semibold"
                  >
                    Páginas Impares
                  </button>
                  <button
                    onClick={handleSelectEven}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition font-semibold"
                  >
                    Páginas Pares
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPages([]);
                      setRangeInput('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs transition"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails grid */}
          <div
            ref={gridContainerRef}
            onMouseDown={handleGridMouseDown}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 relative select-none p-3 rounded-2xl bg-slate-100/80 border border-slate-200 min-h-[300px]"
          >
            {/* Rubberband Selection Marquee Rectangle */}
            {isMarqueeSelecting && marqueeStart && marqueeCurrent && (
              <div
                className="fixed pointer-events-none z-50 bg-amber-400/20 border-2 border-amber-400 rounded-lg shadow-xl"
                style={{
                  left: `${Math.min(marqueeStart.x, marqueeCurrent.x)}px`,
                  top: `${Math.min(marqueeStart.y, marqueeCurrent.y)}px`,
                  width: `${Math.abs(marqueeCurrent.x - marqueeStart.x)}px`,
                  height: `${Math.abs(marqueeCurrent.y - marqueeStart.y)}px`,
                }}
              />
            )}

            {thumbnails.map((thumbUrl, i) => {
              const pageNum = i + 1;
              const isSelected = selectedPages.includes(pageNum);

              return (
                <div
                  key={pageNum}
                  data-page-num={pageNum}
                  onClick={(e) => handlePageClick(pageNum, e)}
                  className={`border rounded-2xl overflow-hidden p-3 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/15'
                      : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-600' : 'text-slate-800'}`}>
                      Pág. {pageNum}
                    </span>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <div className="bg-slate-100/60 rounded-lg p-2 flex items-center justify-center min-h-[140px] pointer-events-none">
                    <img
                      src={thumbUrl}
                      alt={`Página ${pageNum}`}
                      draggable={false}
                      className="max-h-[130px] w-auto object-contain rounded shadow pointer-events-none select-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
</div>
  );
};
