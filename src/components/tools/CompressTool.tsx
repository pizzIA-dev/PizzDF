import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Minimize2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { compressPdf, downloadBlob, formatFileSize } from '../../utils/pdfHelper';

type QualityLevel = 'light' | 'medium' | 'extreme';

export const CompressTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedResult, setCompressedResult] = useState<{
    bytes: Uint8Array;
    originalSize: number;
    newSize: number;
  } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setCompressedResult(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);
    } catch (err) {
      console.error(err);
      addToast('error', 'No pudimos leer ese PDF. ¿Está dañado o protegido con contraseña?');
    }
  };

  const handleCompress = async () => {
    if (!fileBuffer || !file) return;
    setProcessing(true);
    setProgress(0);

    try {
      const compressedBytes = await compressPdf(fileBuffer, quality, (p) => setProgress(p));
      setCompressedResult({
        bytes: compressedBytes,
        originalSize: file.size,
        newSize: compressedBytes.length,
      });
    } catch (err) {
      console.error(err);
      addToast('error', 'No se pudo comprimir ese PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;
    const blob = new Blob([compressedResult.bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
    const originalName = file.name.replace('.pdf', '');
    downloadBlob(blob, `${originalName}_comprimido.pdf`);
  };

  const reductionPercent = compressedResult
    ? Math.max(0, Math.round(((compressedResult.originalSize - compressedResult.newSize) / compressedResult.originalSize) * 100))
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Minimize2 className="w-6 h-6 text-[var(--tomato)]" />
              Comprimir
            </h2>
            <p className="text-xs text-slate-600">
              Baja el peso del PDF para mandarlo por correo o subirlo a un trámite con límite de tamaño.
            </p>
          </div>
        </div>

        {file && (
          <button
            onClick={() => {
              setFile(null);
              setFileBuffer(null);
              setCompressedResult(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-950 shadow-sm transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cambiar Archivo
          </button>
        )}
      </div>

      {!file ? (
        <div className="py-12">
          <FileDropzone
            onFilesSelected={handleFileSelected}
            title="Abre el PDF que quieres aligerar"
            subtitle="El ahorro depende del contenido: un escaneado baja mucho, uno de solo texto casi nada."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* File summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-600 mt-0.5">Tamaño original: {formatFileSize(file.size)}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
              Listo para optimizar
            </span>
          </div>

          {/* Preset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'extreme' as QualityLevel,
                title: 'Muy pequeño',
                desc: 'El archivo más pequeño posible. Las imágenes pierden calidad a simple vista.',
                tag: 'Más pequeño',
              },
              {
                id: 'medium' as QualityLevel,
                title: 'Recomendada',
                desc: 'Punto medio entre peso y nitidez. Sirve para casi todo.',
                tag: 'Recomendada',
              },
              {
                id: 'light' as QualityLevel,
                title: 'Ligera',
                desc: 'Casi igual al original, con un ahorro menor.',
                tag: 'Más fiel',
              },
            ].map(lvl => (
              <div
                key={lvl.id}
                onClick={() => setQuality(lvl.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  quality === lvl.id
                    ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {lvl.tag}
                    </span>
                    {quality === lvl.id && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{lvl.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{lvl.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button & Progress */}
          {!compressedResult ? (
            <div className="pt-4 text-center space-y-4">
              <button
                onClick={handleCompress}
                disabled={processing}
                className="px-8 py-3.5 rounded-2xl font-bold text-base disabled:opacity-50 inline-flex items-center gap-2 btn-primary-sharp"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Optimizando ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-5 h-5" />
                    <span>Comprimir Ahora</span>
                  </>
                )}
              </button>

              {processing && (
                <div className="max-w-md mx-auto space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600">Reduciendo las imágenes de cada página…</p>
                </div>
              )}
            </div>
          ) : (
            /* Result Card */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 animate-fade-in shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <TrendingDown className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">Listo, pesa menos.</h3>
                <p className="text-sm text-slate-600">
                  Se comprimió en tu navegador; el archivo no salió de tu equipo.
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 py-4 border-y border-slate-200 max-w-lg mx-auto">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Antes</span>
                  <p className="text-lg font-bold text-slate-700 line-through">
                    {formatFileSize(compressedResult.originalSize)}
                  </p>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  ↓ {reductionPercent}%
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Ahora</span>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatFileSize(compressedResult.newSize)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="px-8 py-3.5 rounded-2xl font-bold text-base inline-flex items-center gap-2 btn-primary-sharp"
              >
                <Download className="w-5 h-5" />
                <span>Descargar PDF Comprimido</span>
              </button>
            </div>
          )}
        </div>
      )}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
</div>
  );
};
