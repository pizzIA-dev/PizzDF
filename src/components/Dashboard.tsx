import React, { useEffect, useRef, useState } from 'react';
import type { ToolId } from '../types';
import { TOOLS, ToolGlyph } from './toolCatalog';
import { stageFiles } from '../utils/stagedFiles';
import { formatFileSize } from '../utils/pdfHelper';

interface DashboardProps {
  onSelectTool: (tool: ToolId) => void;
}

type Staged = { kind: 'pdf' | 'image'; files: File[] };

const isPdf = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
const isImage = (f: File) => /^image\/(png|jpe?g|webp)$/.test(f.type);

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  const [staged, setStaged] = useState<Staged | null>(null);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [intro, setIntro] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // The rule-drawing intro plays once; re-sorting rows must not replay it.
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const receive = (list: File[]) => {
    const pdfs = list.filter(isPdf);
    const images = list.filter(isImage);
    if (pdfs.length > 0) {
      setStaged({ kind: 'pdf', files: pdfs });
      setNote(null);
    } else if (images.length > 0) {
      setStaged({ kind: 'image', files: images });
      setNote(null);
    } else {
      setNote('Ese formato no sirve aquí. Prueba con PDF, JPG, PNG o WebP.');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files.length > 0) receive(Array.from(e.dataTransfer.files));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!over) setOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  };

  const applies = (input: 'pdf' | 'image') => !staged || staged.kind === input;

  // With files on the table, the tools that can use them come first.
  // Several PDFs at once point to "Unir" before anything else.
  const ordered = [...TOOLS].sort((a, b) => {
    if (!staged) return 0;
    const score = (t: (typeof TOOLS)[number]) =>
      (applies(t.input) ? 0 : 10) + (staged.kind === 'pdf' && staged.files.length > 1 && t.id === 'merge' ? -1 : 0);
    return score(a) - score(b);
  });

  const choose = (id: (typeof TOOLS)[number]['id'], input: 'pdf' | 'image') => {
    if (staged && staged.kind === input) stageFiles(staged.files);
    onSelectTool(id);
  };

  const first = staged?.files[0];

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-16 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-12 lg:gap-16 items-start"
    >
      <section className="sheet-wrap lg:sticky lg:top-24 sheet-in">
        <div className="sheet p-8 sm:p-11 min-h-[30rem] flex flex-col">
          <h1 className="text-[2.6rem] sm:text-5xl leading-[1.04] text-slate-900 max-w-[11ch] sm:max-w-none">
            Tu PDF no sale de tu computadora.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-600 max-w-[34ch]">
            Edítalo, únelo, divídelo o comprímelo aquí mismo. Todo ocurre en la memoria de tu navegador, sin cuentas y sin subir nada.
          </p>

          <div className="mt-auto pt-10">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) receive(Array.from(e.target.files));
                e.target.value = '';
              }}
            />

            <div className="drop-area p-6" data-over={over}>
              {!staged ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-[15px] font-medium text-slate-900">Suelta tu PDF aquí, o en cualquier parte</p>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="btn-primary-sharp px-5 py-2.5 text-sm"
                  >
                    Elegir archivos
                  </button>
                  <p className="text-xs text-slate-600">También acepta fotos JPG, PNG y WebP.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <ul className="space-y-1.5">
                    {staged.files.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-4 font-mono text-[13px] text-slate-900">
                        <span className="truncate">{f.name}</span>
                        <span className="shrink-0 text-slate-600">{formatFileSize(f.size)}</span>
                      </li>
                    ))}
                    {staged.files.length > 4 && (
                      <li className="font-mono text-[13px] text-slate-600">y {staged.files.length - 4} más</li>
                    )}
                  </ul>
                  <div className="flex items-center gap-4 pt-1 text-sm">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="underline underline-offset-4 text-slate-900 hover:text-[var(--tomato)]"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStaged(null)}
                      className="underline underline-offset-4 text-slate-600 hover:text-[var(--tomato)]"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {note && <p className="mt-3 text-sm text-[var(--tomato)]">{note}</p>}
          </div>
        </div>
      </section>

      <section>
        {staged && first && (
          <p className="font-serif text-2xl text-slate-900 mb-5 px-1 leading-snug">
            {staged.files.length > 1 && staged.kind === 'pdf'
              ? `${staged.files.length} PDFs sobre la mesa. ¿Qué hacemos?`
              : staged.kind === 'image'
              ? `${staged.files.length === 1 ? 'Una imagen' : `${staged.files.length} imágenes`} lista${staged.files.length === 1 ? '' : 's'}. ¿Qué hacemos?`
              : '¿Qué hacemos con este PDF?'}
          </p>
        )}

        <ul data-intro={intro} className="border-b border-[var(--rule)]">
          {ordered.map((tool, idx) => (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => choose(tool.id, tool.input)}
                data-dim={!applies(tool.input)}
                style={{ ['--i' as string]: idx } as React.CSSProperties}
                className="tool-row w-full text-left grid grid-cols-[3.25rem_1fr_auto] items-center gap-5 px-3 sm:px-4 py-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--tomato)]"
              >
                <ToolGlyph id={tool.id} className="w-12 h-12 text-slate-900" />
                <span>
                  <span className="tool-title block font-serif text-[1.65rem] leading-tight text-slate-900 transition-colors">
                    {tool.title}
                  </span>
                  <span className="block text-sm text-slate-600 mt-1 max-w-[46ch]">{tool.description}</span>
                </span>
                <span className="tool-go font-mono text-2xl text-slate-500" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-8 px-1 text-[15px] leading-relaxed text-slate-600 max-w-[52ch]">
          ¿Tu negocio necesita una herramienta así, hecha a su medida? En{' '}
          <a href="https://pizzia.org" target="_blank" rel="noreferrer" className="underline underline-offset-4 text-slate-900 hover:text-[var(--tomato)]">
            PizzIA
          </a>{' '}
          construimos software y automatizaciones. Este mismo sitio es una muestra.
        </p>
      </section>
    </div>
  );
};