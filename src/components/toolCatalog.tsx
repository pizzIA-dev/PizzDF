import React from 'react';
import type { ToolId } from '../types';

export interface CatalogTool {
  id: Exclude<ToolId, 'dashboard'>;
  title: string;
  short: string;
  description: string;
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
    description: 'Arrastra para reordenar. Gira o elimina las páginas que no necesites.',
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
    description: 'Reduce el peso para enviarlo por correo o subirlo a un trámite con límite de tamaño.',
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
    description: 'Guarda cada página como una imagen en JPG o PNG.',
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

const ACCENT = '#d97706';

const line = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  fill: 'none',
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};
const accent = { ...line, stroke: ACCENT };

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
          <path d="M16 36L36 20" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        </>
      );
      break;
    case 'page-numbers':
      body = (
        <>
          <rect x="11" y="6" width="22" height="34" rx="1.5" {...line} />
          <path d="M16 14h12M16 20h12M16 26h8" {...line} />
          <text x="22" y="37" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="600" fill={ACCENT}>
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

/** Brand mark: document sheet with golden pizza slice geometry */
export const BrandMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pizzdf-facet-light" x1="5" y1="6" x2="16" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="pizzdf-facet-dark" x1="16" y1="6" x2="27" y2="27" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="pizzdf-crust" x1="5" y1="5" x2="27" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="50%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
    </defs>
    <path d="M5.5 8C8.5 6 12 5.5 16 5.5C20 5.5 23.5 6 26.5 8L16 27.5L5.5 8Z" fill="#1C1917" fillOpacity="0.08" transform="translate(0, 1.5)" />
    <path d="M5 7.5C8.5 6 12 5.5 16 5.5V26.5L5 7.5Z" fill="url(#pizzdf-facet-light)" />
    <path d="M16 5.5C20 5.5 23.5 6 27 7.5L16 26.5V5.5Z" fill="url(#pizzdf-facet-dark)" />
    <line x1="16" y1="5.5" x2="16" y2="26.5" stroke="#78350F" strokeWidth="0.8" strokeOpacity="0.45" />
    <line x1="9" y1="12" x2="14" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
    <line x1="10.5" y1="16" x2="14" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
    <line x1="12" y1="20" x2="14" y2="20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
    <path d="M5 7.5C8.5 5.8 12 5.2 16 5.2C20 5.2 23.5 5.8 27 7.5" stroke="url(#pizzdf-crust)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M5 7.5C8.5 5.8 12 5.2 16 5.2C20 5.2 23.5 5.8 27 7.5L16 26.5L5 7.5Z" stroke="#78350F" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>);