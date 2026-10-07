import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Plus,
  GripVertical
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { imagesToPdf, downloadBlob, formatFileSize } from '../../utils/pdfHelper';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImageToPdfTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<ImageItem[]>([]);
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

  const handleFilesAdded = (files: File[]) => {
    const newItems: ImageItem[] = files.map(file => ({
      id: `img-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    setItems(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  const handleRemove = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setProcessing(true);

    try {
      const pdfBytes = await imagesToPdf(items.map(it => it.file));
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      downloadBlob(blob, 'pizzdf_imagenes_convertidas.pdf');
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al convertir imágenes a PDF.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              Imágenes a PDF
            </h2>
            <p className="text-xs text-slate-600">
              Convierte fotos, comprobantes o capturas JPG y PNG en un solo documento PDF limpio.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleConvert}
            disabled={processing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Crear PDF ({items.length} imágenes)</span>
              </>
            )}
          </button>
        )}
      </div>

      <FileDropzone
        accept="image/png,image/jpeg,image/webp"
        multiple={true}
        allowSample={false}
        onFilesSelected={handleFilesAdded}
        title="Arrastra tus imágenes JPG o PNG aquí"
        subtitle="Puedes agregar varias imágenes simultáneamente y reordenarlas"
      />

      {items.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Orden de las páginas en el PDF final:</span>
            <span className="text-emerald-400 font-bold">{items.length} imágenes cargadas</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item, index) => {
              const isBeingDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;

              let shiftClass = '';
              if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== index) {
                if (draggedIndex < dragOverIndex && index > draggedIndex && index <= dragOverIndex) {
                  shiftClass = '-translate-x-2 scale-[0.98]';
                } else if (draggedIndex > dragOverIndex && index >= dragOverIndex && index < draggedIndex) {
                  shiftClass = 'translate-x-2 scale-[0.98]';
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
                  className={`relative rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 ease-out cursor-grab active:cursor-grabbing select-none ${shiftClass} ${
                    isBeingDragged
                      ? 'opacity-30 scale-95 border-2 border-dashed border-amber-400 bg-amber-400/5'
                      : isDragOver
                      ? 'border-2 border-amber-400 bg-amber-400/10 scale-[1.03] shadow-[0_0_20px_rgba(251,191,36,0.25)] z-10'
                      : 'bg-white border border-slate-200 hover:border-amber-400 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-bold text-slate-800">#{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-30 transition"
                        title="Mover antes"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-30 transition"
                        title="Mover después"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Quitar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-100/60 rounded-xl p-2 flex items-center justify-center min-h-[140px] overflow-hidden">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="max-h-[130px] w-auto object-contain rounded shadow pointer-events-none"
                    />
                  </div>

                  <div className="pt-2 text-[11px] text-slate-600 truncate">
                    {item.file.name}
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
