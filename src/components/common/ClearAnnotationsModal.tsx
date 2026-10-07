import React from 'react';
import { AlertTriangle, X, FileText, Layers } from 'lucide-react';

interface ClearAnnotationsModalProps {
  isOpen: boolean;
  currentPage: number;
  onClose: () => void;
  onClearCurrentPage: () => void;
  onClearAllPages: () => void;
}

export const ClearAnnotationsModal: React.FC<ClearAnnotationsModalProps> = ({
  isOpen,
  currentPage,
  onClose,
  onClearCurrentPage,
  onClearAllPages,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0b0f1a] border border-white/20 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Limpiar Anotaciones</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          Selecciona si deseas eliminar únicamente las anotaciones de la página que estás viendo o las de todo el documento.
        </p>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClearCurrentPage();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400">
                  Solo Página Actual (Pág. {currentPage})
                </h4>
                <p className="text-[11px] text-slate-400">Conserva las demás páginas intactas</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onClearAllPages();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-red-300 group-hover:text-red-200">
                  Todo el Documento Completo
                </h4>
                <p className="text-[11px] text-red-400/80">Elimina todas las anotaciones de todas las páginas</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
