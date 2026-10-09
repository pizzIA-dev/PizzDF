import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Stamp, 
  Download, 
  RefreshCw,
  Sliders,
  Sparkles
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { addWatermark, downloadBlob } from '../../utils/pdfHelper';

export const WatermarkTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
  const [text, setText] = useState('CONFIDENCIAL');
  const [colorHex, setColorHex] = useState('#ef4444');
  const [opacity, setOpacity] = useState(0.25);
  const [size, setSize] = useState(48);
  const [angle, setAngle] = useState(45);
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
      const resultBytes = await addWatermark(fileBuffer, text, {
        opacity,
        size,
        angle,
        colorHex,
      });

      const blob = new Blob([resultBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const originalName = file.name.replace('.pdf', '');
      downloadBlob(blob, `${originalName}_marca_de_agua.pdf`);
    } catch (err) {
      console.error(err);
      addToast('error', 'No se pudo aplicar la marca. Inténtalo de nuevo.');
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
              <Stamp className="w-6 h-6 text-[var(--gold)]" />
              Marca de agua
            </h2>
            <p className="text-xs text-slate-600">
              Escribe un texto como CONFIDENCIAL o COPIA y se estampa en todas las páginas.
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
              disabled={processing || !text.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 btn-primary-sharp"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Aplicando marca...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar con marca</span>
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
            title="Abre el PDF que quieres marcar"
            subtitle="Ajusta texto, inclinación, opacidad y color, y mira una vista previa antes de descargar."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Ajustes de la Marca
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Texto de la marca:</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej. CONFIDENCIAL, COPIA, BORRADOR..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>Opacidad:</span>
                <span className="font-mono text-cyan-400">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.9"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>Tamaño de fuente:</span>
                <span className="font-mono text-cyan-400">{size} pt</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="2"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>Inclinación (Ángulo):</span>
                <span className="font-mono text-cyan-400">{angle}°</span>
              </div>
              <div className="flex gap-2">
                {[0, 30, 45, -45].map(deg => (
                  <button
                    key={deg}
                    onClick={() => setAngle(deg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      angle === deg ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {deg === 0 ? 'Horizontal (0°)' : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Color de la marca:</label>
              <div className="flex items-center gap-2">
                {['#ef4444', '#3b82f6', '#10b981', '#6b7280', '#000000'].map(c => (
                  <button
                    key={c}
                    onClick={() => setColorHex(c)}
                    className={`w-7 h-7 rounded-xl border-2 transition ${
                      colorHex === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Simulation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center shadow-sm">
            <span className="text-xs font-semibold text-slate-600 mb-4">Vista previa simulada</span>
            <div className="relative w-[280px] h-[380px] bg-white rounded-xl shadow-2xl p-6 flex items-center justify-center overflow-hidden border border-slate-300">
              <div className="space-y-3 opacity-20 pointer-events-none w-full">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-200 rounded w-full" />
                <div className="h-2 bg-slate-200 rounded w-full" />
                <div className="h-2 bg-slate-200 rounded w-4/5" />
                <div className="h-2 bg-slate-200 rounded w-full" />
                <div className="h-2 bg-slate-200 rounded w-2/3" />
              </div>

              <div
                className="absolute font-extrabold uppercase select-none pointer-events-none text-center"
                style={{
                  color: colorHex,
                  opacity: opacity,
                  fontSize: `${size * 0.55}px`,
                  transform: `rotate(${-angle}deg)`,
                }}
              >
                {text || 'MARCA DE AGUA'}
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
</div>
  );
};
