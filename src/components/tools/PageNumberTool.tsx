import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Hash, 
  Download, 
  RefreshCw,
  LayoutTemplate
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { addPageNumbers, downloadBlob } from '../../utils/pdfHelper';

export const PageNumberTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left'>('bottom-center');
  const [format, setFormat] = useState<'simple' | 'pageOfTotal' | 'folio'>('pageOfTotal');
  const [fontSize, setFontSize] = useState(11);
  const [processing, setProcessing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);
    } catch (err) {
      console.error(err);
      addToast('error', 'No pudimos leer ese PDF. ¿Está dañado o protegido con contraseña?');
    }
  };

  const handleDownload = async () => {
    if (!fileBuffer || !file) return;
    setProcessing(true);

    try {
      const resultBytes = await addPageNumbers(fileBuffer, {
        format,
        position,
        fontSize,
      });

      const blob = new Blob([resultBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const originalName = file.name.replace('.pdf', '');
      downloadBlob(blob, `${originalName}_numerado.pdf`);
    } catch (err) {
      console.error(err);
      addToast('error', 'No se pudo numerar. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-6 h-6 text-[var(--tomato)]" />
              Numerar
            </h2>
            <p className="text-xs text-slate-600">
              Pone el número de página, o un folio, en la esquina o el centro que elijas.
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFile(null);
                setFileBuffer(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-950 shadow-sm transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cambiar Archivo
            </button>

            <button
              onClick={handleDownload}
              disabled={processing}
              className="px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 btn-primary-sharp"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Numerando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar numerado</span>
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
            title="Abre el PDF que quieres numerar"
            subtitle="Tú decides dónde va y cómo se ve: «Página 1 de 12», solo el número o un folio."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-violet-400" />
              Configuración de Numeración
            </h3>

            {/* Position Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800">Posición en la hoja:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom-center' as const, label: 'Abajo al centro' },
                  { id: 'bottom-right' as const, label: 'Abajo a la derecha' },
                  { id: 'bottom-left' as const, label: 'Abajo a la izquierda' },
                  { id: 'top-right' as const, label: 'Arriba a la derecha' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPosition(p.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                      position === p.id
                        ? 'bg-violet-500 text-white shadow'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800">Formato del texto:</label>
              <div className="space-y-2">
                {[
                  { id: 'pageOfTotal' as const, label: 'Página X de Y (ej. Página 1 de 12)' },
                  { id: 'simple' as const, label: 'Solo número (ej. 1, 2, 3...)' },
                  { id: 'folio' as const, label: 'Folio formal (ej. Folio: 0001)' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition text-left flex items-center justify-between ${
                      format === f.id
                        ? 'bg-violet-500/20 border border-violet-500 text-violet-300'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50/20 shadow-sm'
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>Tamaño de fuente:</span>
                <span className="font-mono text-violet-400">{fontSize} pt</span>
              </div>
              <input
                type="range"
                min="8"
                max="16"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-violet-400"
              />
            </div>
          </div>

          {/* Preview Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center shadow-sm">
            <span className="text-xs font-semibold text-slate-600 mb-4">Vista previa de la hoja</span>
            <div className="relative w-[280px] h-[380px] bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden border border-slate-300">
              <div className="space-y-3 opacity-20 pointer-events-none w-full">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-2 bg-slate-200 rounded w-full" />
                <div className="h-2 bg-slate-200 rounded w-full" />
                <div className="h-2 bg-slate-200 rounded w-4/5" />
              </div>

              {/* Position indicator */}
              <div
                className={`font-mono text-slate-700 font-semibold ${
                  position === 'bottom-center' ? 'text-center' :
                  position === 'bottom-right' ? 'text-right' :
                  position === 'bottom-left' ? 'text-left' : 'text-right absolute top-4 right-6'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {format === 'pageOfTotal' && 'Página 1 de 10'}
                {format === 'simple' && '1'}
                {format === 'folio' && 'Folio: 0001'}
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
</div>
  );
};
