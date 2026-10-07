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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Limpiar Anotaciones</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Selecciona si deseas eliminar únicamente las anotaciones de la página que estás viendo o las de todo el documento.
        </p>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClearCurrentPage();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                  Solo Página Actual (Pág. {currentPage})
                </h4>
                <p className="text-[11px] text-slate-500">Conserva las demás páginas intactas</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onClearAllPages();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-red-50 hover:bg-red-100/80 border border-red-200 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-red-700 group-hover:text-red-800">
                  Todo el Documento Completo
                </h4>
                <p className="text-[11px] text-red-600/80">Elimina todas las anotaciones de todas las páginas</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
