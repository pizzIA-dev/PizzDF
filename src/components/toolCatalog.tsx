import React from 'react';
import type { ToolId } from '../types';

export interface CatalogTool {
  id: Exclude<ToolId, 'dashboard'>;
  /** Name shown as the big verb on the home index */
  title: string;
  /** Short name for the top navigation */
  short: string;
  description: string;
  /** What the tool takes as input */
  input: 'pdf' | 'image';
}

export const TOOLS: CatalogTool[] = [
  {
    id: 'editor',
    title: 'Editar',
    short: 'Editar',
    description: 'Escribe sobre el PDF, firma, estampa sellos, dibuja, inserta tablas e imágenes.',
    input: 'pdf',
  },
  {
    id: 'organize',
    title: 'Organizar páginas',
    short: 'Organizar',
    description: 'Arrastra para reordenar. Gira o elimina las páginas que sobran.',
    input: 'pdf',
  },
  {
    id: 'merge',
    title: 'Unir',
    short: 'Unir',
    description: 'Junta varios PDFs en uno solo, en el orden que tú elijas.',
    input: 'pdf',
  },
  {
    id: 'split',
    title: 'Dividir',
    short: 'Dividir',
    description: 'Saca páginas sueltas o rangos y guárdalos como archivos nuevos.',
    input: 'pdf',
  },
  {
    id: 'compress',
    title: 'Comprimir',
    short: 'Comprimir',
    description: 'Reduce el peso para mandarlo por correo o subirlo a un trámite con límite.',
    input: 'pdf',
  },
  {
    id: 'watermark',
    title: 'Marca de agua',
    short: 'Marca de agua',
    description: 'Pon un texto como CONFIDENCIAL o COPIA en todas las páginas.',
    input: 'pdf',
  },
  {
    id: 'page-numbers',
    title: 'Numerar',
    short: 'Numerar',
    description: 'Agrega número de página o folio en la posición que quieras.',
    input: 'pdf',
  },
  {
    id: 'pdf-to-img',
    title: 'PDF a imágenes',
    short: 'PDF a imágenes',
    description: 'Guarda cada página como una imagen.',
    input: 'pdf',
  },
  {
    id: 'img-to-pdf',
    title: 'Imágenes a PDF',
    short: 'Imágenes a PDF',
    description: 'Convierte fotos o capturas en un PDF, una por página.',
    input: 'image',
  },
];

const ACCENT = '#d7381d';

const line = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  fill: 'none',
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};
const accent = { ...line, stroke: ACCENT };

/** Each tool is drawn with the thing it does to a page, not with a generic icon. */
export const ToolGlyph: React.FC<{ id: CatalogTool['id']; className?: string }> = ({ id, className }) => {
  let body: React.ReactNode = null;
  switch (id) {
    case 'editor':
      body = (
        <>
          <rect x="11" y="6" width="22" height="34" rx="1.5" {...line} />
          <path d="M16 15h12M16 21h12M16 27h6" {...line} />
          <path d="M26 36l11-11" stroke={ACCENT} strokeWidth="3.4" strokeLinecap="round" />
        </>
      );
      break;
    case 'organize':
      body = (
        <>
          <rect x="4" y="16" width="11" height="16" rx="1.2" {...line} />
          <rect x="18.5" y="9" width="11" height="16" rx="1.2" {...accent} />
          <rect x="33" y="16" width="11" height="16" rx="1.2" {...line} />
          <path d="M20 33h8m-3-3 3 3-3 3" {...accent} />
        </>
      );
      break;
    case 'merge':
      body = (
        <>
          <rect x="4" y="6" width="14" height="18" rx="1.2" {...line} />
          <rect x="4" y="24" width="14" height="18" rx="1.2" {...line} />
          <path d="M21 24h8m-3-3 3 3-3 3" {...accent} />
          <rect x="32" y="12" width="12" height="24" rx="1.2" {...line} />
        </>
      );
      break;
    case 'split':
      body = (
        <>
          <path d="M9 6h13v34H9z" {...line} />
          <path d="M26 6h13v34H26z" {...line} />
          <path d="M24 2v44" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" />
        </>
      );
      break;
    case 'compress':
      body = (
        <>
          <rect x="13" y="14" width="22" height="20" rx="1.5" {...line} />
          <path d="M24 3v7m-3-3 3 3 3-3" {...accent} />
          <path d="M24 45v-7m-3 3 3-3 3 3" {...accent} />
        </>
      );
      break;
    case 'watermark':
      body = (
        <>
          <rect x="11" y="6" width="22" height="34" rx="1.5" {...line} />
          <path d="M16 13h12M16 19h12" {...line} />
          <path d="M16 36L36 20" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        </>
      );
      break;
    case 'page-numbers':
      body = (
        <>
          <rect x="11" y="6" width="22" height="34" rx="1.5" {...line} />
          <path d="M16 14h12M16 20h12M16 26h8" {...line} />
          <text x="22" y="37" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="500" fill={ACCENT}>
            7
          </text>
        </>
      );
      break;
    case 'pdf-to-img':
      body = (
        <>
          <rect x="4" y="10" width="15" height="22" rx="1.2" {...line} />
          <path d="M22 21h7m-3-3 3 3-3 3" {...accent} />
          <rect x="32" y="12" width="12" height="18" rx="2" {...line} />
          <circle cx="38" cy="18" r="2" fill={ACCENT} />
          <path d="M32 28l4-5 3 3 2-2 3 4" {...line} />
        </>
      );
      break;
    case 'img-to-pdf':
      body = (
        <>
          <rect x="4" y="12" width="12" height="18" rx="2" {...line} />
          <circle cx="10" cy="18" r="2" fill={ACCENT} />
          <path d="M4 28l4-5 3 3 2-2 3 4" {...line} />
          <path d="M20 21h7m-3-3 3 3-3 3" {...accent} />
          <rect x="30" y="10" width="15" height="22" rx="1.2" {...line} />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {body}
    </svg>
  );
};

/** Brand mark: a sheet with a folded corner and one tomato dot. */
export const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path d="M7 3h12l6 6v20H7z" fill="#fff" stroke="#17171b" strokeWidth="2" strokeLinejoin="round" />
    <path d="M19 3v6h6" fill="none" stroke="#17171b" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="20" r="4.5" fill={ACCENT} />
  </svg>
);