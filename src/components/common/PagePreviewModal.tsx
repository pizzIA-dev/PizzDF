import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  CheckSquare, 
  Square,
  Maximize2
} from 'lucide-react';

interface PagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: any; // PDFDocumentProxy from pdfjsLib
  pageIndex: number; // 0-based index
  totalPages: number;
  rotation?: number; // User-applied rotation degrees (0, 90, 180, 270)
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onRotate?: (degreesDelta: number) => void;
  onNavigate: (newIndex: number) => void;
  fallbackThumbnailUrl?: string;
}

export const PagePreviewModal: React.FC<PagePreviewModalProps> = ({
  isOpen,
  onClose,
  pdfDoc,
  pageIndex,
  totalPages,
  rotation = 0,
  isSelected,
  onToggleSelect,
  onRotate,
  onNavigate,
  fallbackThumbnailUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1.25);
  const [loading, setLoading] = useState(false);
  const renderTaskRef = useRef<any>(null);

  // Render high-DPI page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || pageIndex < 0 || pageIndex >= totalPages) return;
    setLoading(true);

    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }

      const page = await pdfDoc.getPage(pageIndex + 1);
      // Combine native page rotation with user rotation
      const totalRot = ((page.rotate || 0) + rotation + 360) % 360;
      const viewport = page.getViewport({ scale: zoom, rotation: totalRot });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      const task = page.render({
        canvasContext: ctx,
        viewport,
      } as any);

      renderTaskRef.current = task;
      await task.promise;
      ctx.restore();
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering preview page:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [pdfDoc, pageIndex, totalPages, rotation, zoom]);

  useEffect(() => {
    if (isOpen) {
      renderPage();
    }
  }, [isOpen, renderPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && pageIndex > 0) {
        onNavigate(pageIndex - 1);
      } else if (e.key === 'ArrowRight' && pageIndex < totalPages - 1) {
        onNavigate(pageIndex + 1);
      } else if (e.key === ' ' && onToggleSelect) {
        e.preventDefault();
        onToggleSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pageIndex, totalPages, onClose, onNavigate, onToggleSelect]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            {onToggleSelect && (
              <button
                onClick={onToggleSelect}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                title="Seleccionar esta página (Espacio)"
              >
                {isSelected ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <span>Seleccionada</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400" />
                    <span>Seleccionar</span>
                  </>
                )}
              </button>
            )}

            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Página {pageIndex + 1}</span>
              <span className="text-slate-500 font-normal">de {totalPages}</span>
              {rotation !== 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  {rotation}°
                </span>
              )}
            </div>
          </div>

          {/* Controls: Zoom, Rotate, Close */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setZoom(z => Math.max(0.7, z - 0.25))}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Alejar (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-2 text-slate-300 min-w-[44px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Acercar (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1.25)}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white border-l border-slate-700 transition"
                title="Ajustar tamaño óptimo"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rotation Controls */}
            {onRotate && (
              <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
                <button
                  onClick={() => onRotate(-90)}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                  title="Girar a la izquierda -90°"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRotate(90)}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                  title="Girar a la derecha +90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition ml-1"
              title="Cerrar vista previa (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Body Viewport */}
        <div className="relative flex-1 overflow-auto p-6 bg-slate-950/70 flex items-center justify-center min-h-[380px] max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs z-10">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="relative inline-block rounded-lg shadow-2xl overflow-hidden bg-white border border-slate-700">
            <canvas ref={canvasRef} className="block mx-auto" />
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => onNavigate(pageIndex - 1)}
            disabled={pageIndex <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold disabled:opacity-30 disabled:pointer-events-none transition border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
            <span className="text-[10px] text-slate-500 font-mono">(←)</span>
          </button>

          <span className="text-slate-400 text-xs hidden sm:inline">
            Usa las flechas del teclado <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">→</kbd> para navegar
          </span>

          <button
            onClick={() => onNavigate(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold disabled:opacity-30 disabled:pointer-events-none transition border border-slate-700"
          >
            <span>Siguiente</span>
            <span className="text-[10px] text-slate-500 font-mono">(→)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};