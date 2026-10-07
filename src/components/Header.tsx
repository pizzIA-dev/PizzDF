import React from 'react';
import { 
  Pizza, 
  Layers, 
  FileEdit, 
  Files, 
  Scissors, 
  Minimize2, 
  LayoutGrid,
  ShieldCheck,
  Coffee,
  Heart,
  Zap
} from 'lucide-react';
import type { ToolId } from '../types';

interface HeaderProps {
  currentTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  onOpenDonation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTool, onSelectTool, onOpenDonation }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-xl border-b-2 border-amber-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand (Clean, sharp visual) */}
          <div 
            onClick={() => onSelectTool('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 p-[2px] faceted-cut shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] transition-all duration-300">
              <div className="w-full h-full bg-[#080b13] flex items-center justify-center">
                <Pizza className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  <span className="text-amber-400 font-black">P</span>izz<span className="text-amber-400 font-black">DF</span>
                </span>
                <span className="slanted-tab px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950 shadow-sm">
                  <span className="slanted-tab-inner inline-block">PRO</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Suite de PDF
              </p>
            </div>
          </div>

          {/* Quick Tool Navigation (Slanted faceted tabs) */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/40 p-1.5 border border-white/10 faceted-cut">
            {[
              { id: 'organize' as ToolId, label: 'Organizar', icon: Layers },
              { id: 'editor' as ToolId, label: 'Editor', icon: FileEdit },
              { id: 'merge' as ToolId, label: 'Unir', icon: Files },
              { id: 'split' as ToolId, label: 'Dividir', icon: Scissors },
              { id: 'compress' as ToolId, label: 'Comprimir', icon: Minimize2 },
            ].map(({ id, label, icon: Icon }) => {
              const active = currentTool === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectTool(id)}
                  className={`slanted-tab px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="slanted-tab-inner flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right badges & Navigation */}
          <div className="flex items-center gap-3">
            {onOpenDonation && (
              <button
                onClick={onOpenDonation}
                className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Apoyar el proyecto PizzDF"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Invítame un café</span>
                <span className="sm:hidden">Donar</span>
              </button>
            )}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold faceted-cut">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% En tu Navegador</span>
            </div>

            {currentTool !== 'dashboard' && (
              <button
                onClick={() => onSelectTool('dashboard')}
                className="btn-secondary-sharp px-4 py-2 text-xs flex items-center gap-2"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span>Todas las Herramientas</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
