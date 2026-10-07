import React, { useState } from 'react';
import { 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Download, 
  ArrowLeft, 
  RefreshCw, 
  GripVertical,
  Layers,
  ArrowUpDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { FileDropzone } from '../common/FileDropzone';
import { pdfjsLib, renderPageThumbnail, organizePDF, downloadBlob, formatFileSize } from '../../utils/pdfHelper';

interface PageItem {
  id: string;
  originalIndex: number;
  displayNumber: number;
  rotation: number;
  thumbnailUrl: string;
}

export const OrganizeTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);
  const gridContainerRef = React.useRef<HTMLDivElement | null>(null);

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
      const loadedPages: PageItem[] = [];

      for (let i = 1; i <= numPages; i++) {
        const thumb = await renderPageThumbnail(pdf, i, 0.4);
        loadedPages.push({
          id: `page-${i}-${Date.now()}-${Math.random()}`,
          originalIndex: i - 1,
          displayNumber: i,
          rotation: 0,
          thumbnailUrl: thumb.url,
        });
      }

      setPages(loadedPages);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error loading PDF:', err);
      addToast('error', 'Error al leer el archivo PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = (index: number, degreesDelta: number) => {
    setPages(prev => {
      const next = [...prev];
      const newRotation = (next[index].rotation + degreesDelta + 360) % 360;
      next[index] = { ...next[index], rotation: newRotation };
      return next;
    });
  };

  const handleDelete = (index: number) => {
    if (pages.length <= 1) {
      addToast('error', 'El documento debe contener al menos una página.');
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicate = (index: number) => {
    setPages(prev => {
      const target = prev[index];
      const copy: PageItem = {
        ...target,
        id: `page-copy-${Date.now()}-${Math.random()}`,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleRotateAll = (degreesDelta: number) => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: (p.rotation + degreesDelta + 360) % 360,
    })));
  };

  const handleReverseOrder = () => {
    setPages(prev => [...prev].reverse());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (selectedIds.size >= pages.length) {
      addToast('error', 'No puedes eliminar todas las páginas.');
      return;
    }
    setPages(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

    // Smart selection with Shift (range) and Ctrl/Cmd (multi-toggle)
  const handlePageClick = (index: number, e: React.MouseEvent) => {
    const pageId = pages[index]?.id;
    if (!pageId) return;

    if (e.shiftKey && lastClickedIndex !== null) {
      // Range selection between lastClickedIndex and index
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = pages.slice(start, end + 1).map(p => p.id);

      setSelectedIds(prev => {
        const next = new Set(e.ctrlKey || e.metaKey ? prev : []);
        rangeIds.forEach(id => next.add(id));
        return next;
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle individual selection
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(pageId)) next.delete(pageId);
        else next.add(pageId);
        return next;
      });
      setLastClickedIndex(index);
    } else {
      // Simple click: select only this page or toggle if it's already selected alone
      setSelectedIds(prev => {
        if (prev.has(pageId) && prev.size === 1) return new Set();
        return new Set([pageId]);
      });
      setLastClickedIndex(index);
    }
  };

  // Marquee (drag box) selection handlers
  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only block marquee if clicking directly inside action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // If clicking directly on a card without Shift or Ctrl, let card drag/click handle it
    const cardEl = (e.target as HTMLElement).closest('[data-page-id]');
    if (cardEl && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      return;
    }

    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      setSelectedIds(new Set());
    }

    setIsMarqueeSelecting(true);
    setMarqueeStart({ x: e.clientX, y: e.clientY });
    setMarqueeCurrent({ x: e.clientX, y: e.clientY });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMarqueeSelecting || !marqueeStart || !gridContainerRef.current) return;
      setMarqueeCurrent({ x: e.clientX, y: e.clientY });

      const x1 = Math.min(marqueeStart.x, e.clientX);
      const y1 = Math.min(marqueeStart.y, e.clientY);
      const x2 = Math.max(marqueeStart.x, e.clientX);
      const y2 = Math.max(marqueeStart.y, e.clientY);

      // Find all page cards that intersect with the marquee box
      const cardEls = gridContainerRef.current.querySelectorAll('[data-page-id]');
      const intersectingIds = new Set<string>();

      cardEls.forEach(card => {
        const rect = card.getBoundingClientRect();
        const intersects = !(rect.right < x1 || rect.left > x2 || rect.bottom < y1 || rect.top > y2);
        if (intersects) {
          const id = card.getAttribute('data-page-id');
          if (id) intersectingIds.add(id);
        }
      });

      setSelectedIds(intersectingIds);
    };

    const handleMouseUp = () => {
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeCurrent(null);
    };

    if (isMarqueeSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMarqueeSelecting, marqueeStart]);

  const toggleSelectPage = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectEven = () => {
    const evens = new Set(pages.filter((_, i) => (i + 1) % 2 === 0).map(p => p.id));
    setSelectedIds(evens);
  };

  const handleSelectOdd = () => {
    const odds = new Set(pages.filter((_, i) => (i + 1) % 2 !== 0).map(p => p.id));
    setSelectedIds(odds);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map(p => p.id)));
    }
  };

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragEnter = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && dragOverIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleDragOver = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && dragOverIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDropOnPage = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const draggedPage = pages[draggedIndex];
    if (!draggedPage) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // If dragged card is part of multi-selection, move all selected items together
    if (selectedIds.has(draggedPage.id) && selectedIds.size > 1) {
      setPages(prev => {
        const selectedItems = prev.filter(p => selectedIds.has(p.id));
        const remainingItems = prev.filter(p => !selectedIds.has(p.id));
        const targetPage = prev[targetIndex];

        let insertPos = remainingItems.findIndex(p => p.id === targetPage?.id);
        if (insertPos === -1) {
          insertPos = remainingItems.length;
        } else if (targetIndex > draggedIndex) {
          insertPos += 1;
        }

        remainingItems.splice(insertPos, 0, ...selectedItems);
        return remainingItems;
      });
      addToast('info', `${selectedIds.size} páginas reordenadas`);
    } else {
      handleMove(draggedIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDownload = async () => {
    if (!fileBuffer || pages.length === 0) return;
    setProcessing(true);

    try {
      const pageConfigs = pages.map(p => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation,
      }));

      const organizedBytes = await organizePDF(fileBuffer, pageConfigs);
      const blob = new Blob([organizedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const originalName = file?.name?.replace('.pdf', '') || 'documento';
      downloadBlob(blob, `${originalName}_organizado.pdf`);
    } catch (err) {
      console.error('Error saving organized PDF:', err);
      addToast('error', 'Error al generar el PDF organizado.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-amber-400" />
              Organizador de Páginas
            </h2>
            <p className="text-xs text-slate-600">
              Reordena, rota, duplica o elimina páginas arrastrándolas con total libertad.
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFile(null);
                setFileBuffer(null);
                setPages([]);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cambiar Archivo
            </button>

            <button
              onClick={handleDownload}
              disabled={processing || pages.length === 0}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF ({pages.length} págs)</span>
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
            title="Sube el PDF que deseas organizar"
            subtitle="Podrás reordenar las páginas visualmente, rotarlas y eliminar las que no necesites"
          />
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-700 text-xs font-medium">Renderizando miniaturas del documento...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white/95 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-20 z-30 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{file.name}</span>
              <span>•</span>
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{pages.length} páginas</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRotateAll(-90)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Rotar Todo -90°
              </button>

              <button
                onClick={() => handleRotateAll(90)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                Rotar Todo +90°
              </button>

              <button
                onClick={handleReverseOrder}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                Invertir Orden
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar ({selectedIds.size})
                </button>
              )}

              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
              >
                {selectedIds.size === pages.length ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    Deseleccionar
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                    Seleccionar Todo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pages Grid Workspace with outer margin for marquee drag */}
          <div
            ref={gridContainerRef}
            onMouseDown={handleGridMouseDown}
            className="relative select-none p-6 sm:p-8 rounded-2xl bg-slate-100/80 border border-slate-200 min-h-[450px]"
          >
            {/* Rubberband Selection Marquee Rectangle */}
            {isMarqueeSelecting && marqueeStart && marqueeCurrent && (
              <div
                className="fixed pointer-events-none z-50 bg-amber-500/20 border-2 border-amber-500 rounded-lg shadow-xl"
                style={{
                  left: `${Math.min(marqueeStart.x, marqueeCurrent.x)}px`,
                  top: `${Math.min(marqueeStart.y, marqueeCurrent.y)}px`,
                  width: `${Math.abs(marqueeCurrent.x - marqueeStart.x)}px`,
                  height: `${Math.abs(marqueeCurrent.y - marqueeStart.y)}px`,
                }}
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
            {pages.map((page, index) => {
              const isSelected = selectedIds.has(page.id);
              const isBeingDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;

              // Smooth dynamic shifting of neighboring pages while dragging
              let shiftClass = '';
              if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== index) {
                if (draggedIndex < dragOverIndex && index > draggedIndex && index <= dragOverIndex) {
                  shiftClass = '-translate-x-2 sm:-translate-x-3 scale-[0.98]';
                } else if (draggedIndex > dragOverIndex && index >= dragOverIndex && index < draggedIndex) {
                  shiftClass = 'translate-x-2 sm:translate-x-3 scale-[0.98]';
                }
              }

              return (
                <div
                  key={page.id}
                  data-page-id={page.id}
                  draggable
                  onClick={(e) => handlePageClick(index, e)}
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragEnter={(e) => handleDragEnter(index, e)}
                  onDragOver={(e) => handleDragOver(index, e)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDropOnPage(index, e)}
                  className={`group relative bg-white border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out cursor-grab active:cursor-grabbing select-none shadow-sm hover:shadow-md ${shiftClass} ${
                    isBeingDragged
                      ? 'opacity-30 scale-95 border-amber-400 border-dashed ring-2 ring-amber-400/30'
                      : isDragOver
                      ? 'border-amber-400 ring-2 ring-amber-400/60 scale-[1.03] shadow-[0_0_25px_rgba(251,191,36,0.35)] z-20'
                      : isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {/* Glowing landing slot indicator when hovering over this position */}
                  {isDragOver && (
                    <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl border-2 border-amber-400 bg-amber-400/15 flex items-center justify-center animate-pulse backdrop-blur-[1px]">
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transform scale-105">
                        <GripVertical className="w-3.5 h-3.5" />
                        Insertar aquí
                      </span>
                    </div>
                  )}
                  {/* Card Header */}
                  <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPage(page.id);
                        }}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-[11px] font-bold text-slate-800">
                        Pág. {index + 1}
                      </span>
                    </div>

                    <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                  </div>

                  {/* Thumbnail container */}
                  <div className="relative p-3 flex items-center justify-center bg-slate-100/60 min-h-[170px] overflow-hidden">
                    <div
                      className="transition-transform duration-300 flex items-center justify-center"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    >
                      <img
                        src={page.thumbnailUrl}
                        alt={`Página ${index + 1}`}
                        className="max-h-[160px] w-auto object-contain rounded shadow-md pointer-events-none"
                      />
                    </div>

                    {page.rotation !== 0 && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400 text-slate-950 font-black shadow">
                        {page.rotation}°
                      </span>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-around gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRotate(index, -90); }}
                      title="Rotar a la izquierda"
                      className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-amber-600 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRotate(index, 90); }}
                      title="Rotar a la derecha"
                      className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-amber-600 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(index); }}
                      title="Duplicar página"
                      className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-blue-600 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                      title="Eliminar página"
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
</div>
  );
};
