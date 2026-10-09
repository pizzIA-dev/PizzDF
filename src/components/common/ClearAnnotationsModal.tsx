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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-md p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <AlertTriangle className="w-5 h-5 text-[var(--gold)]" />
            <span className="font-serif text-lg">Borrar cambios</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          ¿Quieres borrar solo lo agregado en esta página o en todo el documento?
        </p>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClearCurrentPage();
              onClose();
            }}
            className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[var(--gold)]">
                  Solo esta página (pág. {currentPage})
                </h4>
                <p className="text-xs text-slate-500">Deja intactas las demás páginas</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onClearAllPages();
              onClose();
            }}
            className="w-full p-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-700">
                  Todo el documento
                </h4>
                <p className="text-xs text-red-600/80">Quita firmas, textos y sellos de todas las páginas</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="btn-secondary-sharp px-4 py-2 text-xs"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
