import React from 'react';
import type { ToolId } from '../types';
import { TOOLS, BrandMark } from './toolCatalog';

interface HeaderProps {
  currentTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  onOpenDonation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTool, onSelectTool, onOpenDonation }) => {
  const inTool = currentTool !== 'dashboard';

  return (
    <header className="sticky top-0 z-50 bg-[var(--desk)]/95 backdrop-blur border-b border-[var(--rule)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => onSelectTool('dashboard')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          aria-label="PizzDF, volver al inicio"
        >
          <BrandMark className="w-8 h-8" />
          <span className="font-serif text-[1.65rem] leading-none text-slate-900 tracking-tight">
            Pizz<span className="text-[var(--gold)] font-medium">DF</span>
          </span>
        </button>

        {inTool && (
          <nav aria-label="Herramientas" className="hidden md:flex items-stretch gap-6 overflow-x-auto h-full">
            {TOOLS.map((t) => {
              const active = currentTool === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTool(t.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative whitespace-nowrap text-sm cursor-pointer transition-colors ${
                    active ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.short}
                  {active && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--gold)]" />}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-5 shrink-0 text-sm">
          {inTool && (
            <button
              type="button"
              onClick={() => onSelectTool('dashboard')}
              className="md:hidden text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Inicio
            </button>
          )}
          {onOpenDonation && (
            <button
              type="button"
              onClick={onOpenDonation}
              className="text-slate-900 underline underline-offset-4 decoration-[var(--gold)] decoration-2 hover:text-[var(--gold)] cursor-pointer"
            >
              Invítame un café
            </button>
          )}
        </div>
      </div>
    </header>
  );
};