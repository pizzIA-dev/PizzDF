import React, { useState } from 'react';
import { X, Check, Stamp as StampIcon, Sparkles, UploadCloud, Image as ImageIcon } from 'lucide-react';

export interface StampData {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isImage?: boolean;
  imageData?: string;
}

interface StampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (stamp: StampData) => void;
}

const PRESET_STAMPS: StampData[] = [
  { label: 'APROBADO', color: '#16a34a', bgColor: '#dcfce7', borderColor: '#86efac' },
  { label: 'CONFIDENCIAL', color: '#dc2626', bgColor: '#fee2e2', borderColor: '#fca5a5' },
  { label: 'PAGADO', color: '#059669', bgColor: '#d1fae5', borderColor: '#6ee7b7' },
  { label: 'RECHAZADO', color: '#e11d48', bgColor: '#ffe4e6', borderColor: '#fda4af' },
  { label: 'BORRADOR', color: '#2563eb', bgColor: '#dbeafe', borderColor: '#93c5fd' },
  { label: 'URGENTE', color: '#ea580c', bgColor: '#ffedd5', borderColor: '#fdba74' },
  { label: 'COPIA', color: '#475569', bgColor: '#f1f5f9', borderColor: '#cbd5e1' },
];

export const StampModal: React.FC<StampModalProps> = ({ isOpen, onClose, onSelectStamp }) => {
  const [tab, setTab] = useState<'preset' | 'custom' | 'image'>('preset');
  const [customText, setCustomText] = useState('');
  const [customColor, setCustomColor] = useState('#dc2626');
  const [stampImageUrl, setStampImageUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomApply = () => {
    if (!customText.trim()) return;
    const stamp: StampData = {
      label: customText.trim().toUpperCase(),
      color: customColor,
      bgColor: `${customColor}22`,
      borderColor: customColor,
    };
    onSelectStamp(stamp);
    onClose();
  };

  const handleUploadStampImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setStampImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyImageStamp = () => {
    if (!stampImageUrl) return;
    onSelectStamp({
      label: 'SELLO IMAGEN',
      color: '#dc2626',
      bgColor: 'transparent',
      borderColor: 'transparent',
      isImage: true,
      imageData: stampImageUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base">
            <StampIcon className="w-5 h-5 text-amber-400" />
            <span>Sellos</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setTab('preset')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'preset' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Predefinidos</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'custom' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalizado</span>
          </button>
          <button
            onClick={() => setTab('image')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'image' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Subir Sello</span>
          </button>
        </div>

        {/* Presets Grid */}
        {tab === 'preset' && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">
              Elige un sello:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_STAMPS.map(stamp => (
                <button
                  key={stamp.label}
                  onClick={() => {
                    onSelectStamp(stamp);
                    onClose();
                  }}
                  className="p-3 rounded-xl border-2 font-black uppercase tracking-wider text-xs shadow-sm hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center"
                  style={{
                    backgroundColor: stamp.bgColor,
                    borderColor: stamp.borderColor,
                    color: stamp.color,
                  }}
                >
                  {stamp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Stamp */}
        {tab === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">Texto del sello:</label>
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Ej. REVISADO, COPIA, FECHA..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 uppercase"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
              <span>Color del sello:</span>
              <div className="flex items-center gap-2">
                {['#dc2626', '#16a34a', '#2563eb', '#d97706', '#9333ea'].map(c => (
                  <button
                    key={c}
                    onClick={() => setCustomColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      customColor === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* Live Preview */}
            {customText.trim() && (
              <div className="pt-2 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 mb-1">Vista previa:</span>
                <div
                  className="px-5 py-2 rounded-xl border-2 font-black uppercase tracking-wider text-sm shadow-md"
                  style={{
                    backgroundColor: `${customColor}22`,
                    borderColor: customColor,
                    color: customColor,
                  }}
                >
                  {customText.toUpperCase()}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleCustomApply}
                disabled={!customText.trim()}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition disabled:opacity-40"
              >
                Crear y Estampar
              </button>
            </div>
          </div>
        )}

        {/* Upload Image Stamp */}
        {tab === 'image' && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-amber-50/20">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleUploadStampImage}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-amber-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">Sube una imagen o logo de tu sello</span>
              <span className="text-[11px] text-slate-500 mt-0.5">PNG transparente recomendado</span>
            </label>

            {stampImageUrl && (
              <div className="p-3 bg-white/95 rounded-xl flex items-center justify-center max-h-[140px] overflow-hidden">
                <img src={stampImageUrl} alt="Sello subido" className="max-h-[120px] object-contain" />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={handleApplyImageStamp}
                disabled={!stampImageUrl}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition disabled:opacity-40"
              >
                Estampar Imagen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
