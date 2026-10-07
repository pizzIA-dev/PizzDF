import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Files, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  RefreshCw,
  FileCheck,
  GripVertical
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { mergePDFs, downloadBlob, formatFileSize } from '../../utils/pdfHelper';
import { PDFDocument } from 'pdf-lib';

interface MergeItem {
  id: string;
  file: File;
  pageCount: number;
  size: number;
}

export const MergeTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && dragOverIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      setItems(prev => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
      addToast('info', 'Archivos reordenados');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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

  const [processing, setProcessing] = useState(false);

  const handleFilesAdded = async (files: File[]) => {
    const newItems: MergeItem[] = [];

    for (const f of files) {
      try {
        const buffer = await f.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newItems.push({
          id: `merge-${Date.now()}-${Math.random()}`,
          file: f,
          pageCount: doc.getPageCount(),
          size: f.size,
        });
      } catch (err) {
        console.error('Error loading PDF for merge:', err);
      }
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setItems(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const handleRemove = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleMergeAndDownload = async () => {
    if (items.length < 2) {
      addToast('error', 'Debes agregar al menos 2 documentos PDF para unirlos.');
      return;
    }

    setProcessing(true);
    try {
      const buffers: ArrayBuffer[] = [];
      for (const item of items) {
        buffers.push(await item.file.arrayBuffer());
      }

      const mergedBytes = await mergePDFs(buffers);
      const blob = new Blob([mergedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      downloadBlob(blob, 'pizzdf_documentos_unidos.pdf');
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al fusionar los PDFs.');
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = items.reduce((acc, curr) => acc + curr.pageCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Files className="w-6 h-6 text-emerald-400" />
              Unir PDFs
            </h2>
            <p className="text-xs text-slate-400">
              Combina múltiples documentos PDF en uno solo con el orden exacto que necesitas.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleMergeAndDownload}
            disabled={processing || items.length < 2}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Fusionando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unir {items.length} PDFs ({totalPages} páginas)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* File Dropzone */}
      <FileDropzone
        onFilesSelected={handleFilesAdded}
        multiple={true}
        title="Arrastra los PDFs que deseas unir"
        subtitle="Puedes añadir varios archivos a la vez y luego ordenarlos a tu gusto"
      />

      {/* Document List */}
      {items.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Orden de unión (los archivos se combinarán de arriba hacia abajo):</span>
            <span className="text-emerald-400 font-bold">{items.length} archivos añadidos</span>
          </div>

          <div className="space-y-2.5">
            {items.map((item, index) => {
              const isBeingDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;

              // Smooth dynamic shifting of neighboring file items while dragging
              let shiftClass = '';
              if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== index) {
                if (draggedIndex < dragOverIndex && index > draggedIndex && index <= dragOverIndex) {
                  shiftClass = '-translate-y-2';
                } else if (draggedIndex > dragOverIndex && index >= dragOverIndex && index < draggedIndex) {
                  shiftClass = 'translate-y-2';
                }
              }

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragEnter={(e) => handleDragEnter(index, e)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(index)}
                  className={`relative rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing select-none ${shiftClass} ${
                    isBeingDragged
                      ? 'opacity-30 scale-[0.98] border-2 border-dashed border-amber-400 bg-amber-400/5'
                      : isDragOver
                      ? 'border-2 border-amber-400 bg-amber-400/10 scale-[1.01] shadow-[0_0_20px_rgba(251,191,36,0.25)] z-10'
                      : 'bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.file.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{item.pageCount} páginas</span>
                        <span>•</span>
                        <span>{formatFileSize(item.size)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
                      title="Subir posición"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === items.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
                      title="Bajar posición"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      title="Quitar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
