import React, { useState } from 'react';
import { 
  Heart, 
  Coffee, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  Share2
} from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'local' | 'crypto'>('global');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'PizzDF - Suite Libre de PDF',
        text: 'Edita, organiza, comprime y une PDFs 100% en tu navegador y sin límites.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy(window.location.href, 'share');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white border-2 border-amber-400 rounded-2xl shadow-2xl text-slate-800 overflow-hidden flex flex-col"
      >
        {/* Glow Header Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/[0.08] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Heart className="w-5 h-5 text-amber-400 fill-amber-400/30 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Apoyar a PizzDF
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 rounded">
                  100% Libre
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Herramientas sin límites, sin registro y sin servidores espía.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Value Proposition */}
        <div className="px-6 py-3.5 bg-amber-50/70 border-b border-amber-100 flex items-center gap-3 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            PizzDF procesa tus archivos directamente en la RAM de tu navegador. Tu apoyo voluntario ayuda a mantener el proyecto activo y añadir nuevas herramientas.
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'global'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Internacional
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'local'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Yape / Plin
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'crypto'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cripto (USDT)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-3.5">
          {activeTab === 'global' && (
            <div className="space-y-2.5">
              <a
                href="https://www.buymeacoffee.com/lsanchezpizzia"
                target="_blank"
                rel="noreferrer"
                className="group p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 shadow-sm flex items-center justify-between transition hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFDD00]/10 flex items-center justify-center text-lg">
                    ☕
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                      Buy Me a Coffee
                    </h4>
                    <p className="text-[11px] text-slate-400">Invita un café ($3 o $5 USD) con tarjeta de crédito/débito</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </a>

              <a
                href="https://ko-fi.com/lsanchezpizzia"
                target="_blank"
                rel="noreferrer"
                className="group p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 shadow-sm flex items-center justify-between transition hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#13C3FF]/10 flex items-center justify-center text-lg">
                    💙
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                      Ko-fi
                    </h4>
                    <p className="text-[11px] text-slate-400">Donación voluntaria directa vía PayPal o Stripe</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </a>

              <a
                href="https://paypal.me/lsanchezpizzia"
                target="_blank"
                rel="noreferrer"
                className="group p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 shadow-sm flex items-center justify-between transition hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#00457C]/20 flex items-center justify-center text-lg">
                    🅿️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                      PayPal
                    </h4>
                    <p className="text-[11px] text-slate-400">Transferencia segura desde cualquier país del mundo</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </a>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center justify-center gap-2">
                  <span className="text-purple-400">Yape</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Perú
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Abre Yape en tu celular y escanea el código QR oficial:
                </p>
              </div>

              {/* QR Container */}
              <div className="relative mx-auto w-56 max-w-full bg-[#730D8D] p-2.5 rounded-2xl shadow-xl shadow-purple-500/20 border-2 border-amber-400/60 flex flex-col items-center justify-center">
                <img
                  src="/qr-donacion.png"
                  alt="Código QR Yape - Luis Angel Sanchez Aguilar"
                  className="w-full h-auto max-h-[260px] object-contain rounded-xl shadow-md"
                />
              </div>

              <div className="pt-1">
                <span className="text-xs text-slate-700 font-semibold block">
                  Titular: <span className="text-amber-400 font-bold">Luis Angel Sanchez Aguilar</span>
                </span>
              </div>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  ₮
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">USDT (Red TRC20 / TRON)</h4>
                  <p className="text-[10px] text-slate-400">Billetera oficial para donaciones en USDT (Red TRON)</p>
                </div>
              </div>

              <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-300 truncate">
                  TEF8EiYzaVQJo5T5KQxWzgM35HxLVsaLwq
                </span>
                <button
                  onClick={() => handleCopy('TEF8EiYzaVQJo5T5KQxWzgM35HxLVsaLwq', 'crypto')}
                  className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-[10px] font-bold text-slate-300 shrink-0 flex items-center gap-1 transition"
                >
                  {copiedKey === 'crypto' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Free Alternative Support */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">¿No puedes donar? También ayudas compartiendo:</span>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200 font-semibold transition flex items-center gap-1.5"
          >
            {copiedKey === 'share' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enlace copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Compartir Web</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
