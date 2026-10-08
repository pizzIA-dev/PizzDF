import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, Type, UploadCloud } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a');
  const [penThickness, setPenThickness] = useState(2.5);

  // Type signature state
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState<'Caveat' | 'Dancing Script' | 'cursive'>('Caveat');

  // Upload signature state
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [isOpen, tab]);

  if (!isOpen) return null;

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert typed name to transparent PNG image
  const generateTypedSignatureDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `64px '${selectedFont}', cursive`;
    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Firma', canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImgUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      onSave(canvas.toDataURL('image/png'));
    } else if (tab === 'type') {
      if (!typedName.trim()) return;
      onSave(generateTypedSignatureDataUrl());
    } else if (tab === 'upload') {
      if (!uploadedImgUrl) return;
      onSave(uploadedImgUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <span>Crear Firma Digital</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setTab('draw')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'draw' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Dibujar</span>
          </button>
          <button
            onClick={() => setTab('type')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'type' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Escribir</span>
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'upload' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Subir</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'draw' && (
          <div className="space-y-3">
            {/* Ink color and thickness */}
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span>Color:</span>
                {[
                  { hex: '#0f172a', name: 'Negro' },
                  { hex: '#1d4ed8', name: 'Azul' },
                  { hex: '#047857', name: 'Verde' },
                ].map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setPenColor(c.hex)}
                    className={`w-5 h-5 rounded-full border-2 transition ${
                      penColor === c.hex ? 'border-amber-400 scale-125' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span>Grosor:</span>
                {[1.5, 2.5, 4].map(w => (
                  <button
                    key={w}
                    onClick={() => setPenThickness(w)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      penThickness === w ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {w === 1.5 ? 'Fino' : w === 2.5 ? 'Medio' : 'Grueso'}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner">
              <canvas
                ref={canvasRef}
                width={480}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[180px] cursor-crosshair touch-none"
              />
              <div className="absolute bottom-3 left-6 right-6 border-b border-dashed border-slate-300 pointer-events-none flex justify-between text-[11px] text-slate-400">
                <span>Traza tu firma aquí</span>
                <span>✕</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'type' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Tu nombre completo o iniciales:</label>
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="Ej. Luis Angel Pérez"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Estilo de caligrafía:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Caveat' as const, label: 'Elegante Natural' },
                  { id: 'Dancing Script' as const, label: 'Caligráfica Clásica' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedFont === f.id
                        ? 'border-amber-400 bg-amber-500/10 text-slate-950 shadow'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block">{f.label}</span>
                    <span
                      className="text-2xl mt-1 block truncate"
                      style={{ fontFamily: `'${f.id}', cursive`, color: penColor }}
                    >
                      {typedName || 'Ejemplo Firma'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ink color picker for typed */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>Color de tinta:</span>
              {['#0f172a', '#1d4ed8', '#047857'].map(hex => (
                <button
                  key={hex}
                  onClick={() => setPenColor(hex)}
                  className={`w-5 h-5 rounded-full border-2 transition ${
                    penColor === hex ? 'border-amber-400 scale-125' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'upload' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-amber-50/20">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleUploadImage}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-amber-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">Haz clic para subir imagen de tu firma</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Formatos recomendados: PNG o JPG con fondo claro</span>
            </label>

            {uploadedImgUrl && (
              <div className="p-3 bg-white rounded-xl flex items-center justify-center max-h-[140px] overflow-hidden">
                <img src={uploadedImgUrl} alt="Firma subida" className="max-h-[120px] object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          {tab === 'draw' ? (
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={
                (tab === 'draw' && !hasDrawn) ||
                (tab === 'type' && !typedName.trim()) ||
                (tab === 'upload' && !uploadedImgUrl)
              }
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>Usar Firma</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
