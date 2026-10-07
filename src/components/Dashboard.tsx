import React, { useState } from 'react';
import { 
  Layers, 
  FileEdit, 
  Files, 
  Scissors, 
  Minimize2, 
  Stamp, 
  Hash, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import type { ToolId, ToolDef } from '../types';

interface DashboardProps {
  onSelectTool: (tool: ToolId) => void;
}

interface ToolItem extends ToolDef {
  number: string;
  badgeText?: string;
  speedRating: number;
  powerRating: number;
}

const TOOLS: ToolItem[] = [
  {
    id: 'editor',
    number: '01',
    title: 'Editor de PDF',
    description: 'Escribe dibuja resalta añade tablas inserta sellos y firma tus documentos.',
    category: 'edit',
    badgeText: 'MÁS COMPLETO',
    icon: 'FileEdit',
    color: 'from-amber-500 to-yellow-300 text-amber-300',
    speedRating: 5,
    powerRating: 5,
  },
  {
    id: 'organize',
    number: '02',
    title: 'Organizar Páginas',
    description: 'Reordena rota duplica y elimina páginas en tiempo real.',
    category: 'organize',
    badgeText: 'POPULAR',
    icon: 'Layers',
    color: 'from-orange-500 to-amber-400 text-orange-300',
    speedRating: 5,
    powerRating: 4,
  },
  {
    id: 'merge',
    number: '03',
    title: 'Unir PDFs',
    description: 'Combina múltiples documentos PDF en un único archivo organizado con el orden exacto que necesitas.',
    category: 'organize',
    icon: 'Files',
    color: 'from-emerald-500 to-teal-300 text-emerald-300',
    speedRating: 5,
    powerRating: 5,
  },
  {
    id: 'split',
    number: '04',
    title: 'Dividir y Separar',
    description: 'Extrae rangos de páginas específicos a un nuevo PDF o separa cada una de las páginas en archivos individuales en un ZIP.',
    category: 'organize',
    icon: 'Scissors',
    color: 'from-purple-500 to-pink-400 text-purple-300',
    speedRating: 5,
    powerRating: 4,
  },
  {
    id: 'compress',
    number: '05',
    title: 'Comprimir PDF',
    description: 'Reduce el peso de tus archivos conservando la nitidez del texto para trámites o envíos por correo.',
    category: 'optimize',
    badgeText: 'HASTA -85%',
    icon: 'Minimize2',
    color: 'from-rose-500 to-red-400 text-rose-300',
    speedRating: 4,
    powerRating: 5,
  },
  {
    id: 'watermark',
    number: '06',
    title: 'Marca de Agua',
    description: 'Inserta sellos de seguridad con ángulo diagonal u horizontal, opacidad regulable y colores personalizados.',
    category: 'security',
    icon: 'Stamp',
    color: 'from-cyan-500 to-sky-300 text-cyan-300',
    speedRating: 5,
    powerRating: 4,
  },
  {
    id: 'page-numbers',
    number: '07',
    title: 'Numerar Páginas',
    description: 'Inserta números de página o folios formales con personalización de posición, formato y tamaño de fuente.',
    category: 'edit',
    icon: 'Hash',
    color: 'from-violet-500 to-indigo-300 text-violet-300',
    speedRating: 5,
    powerRating: 3,
  },
  {
    id: 'pdf-to-img',
    number: '08',
    title: 'PDF a Imágenes',
    description: 'Exporta cada una de las páginas de tu documento en imágenes JPG o PNG en alta resolución Retina.',
    category: 'convert',
    icon: 'ImageIcon',
    color: 'from-yellow-400 to-amber-500 text-yellow-300',
    speedRating: 4,
    powerRating: 4,
  },
  {
    id: 'img-to-pdf',
    number: '09',
    title: 'Imágenes a PDF',
    description: 'Transforma colecciones de imágenes, recibos o fotos JPG y PNG en un documento PDF ordenado y listo para compartir.',
    category: 'convert',
    icon: 'FileEdit',
    color: 'from-emerald-400 to-green-500 text-emerald-300',
    speedRating: 5,
    powerRating: 4,
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-6 h-6" />;
      case 'FileEdit': return <FileEdit className="w-6 h-6" />;
      case 'Files': return <Files className="w-6 h-6" />;
      case 'Scissors': return <Scissors className="w-6 h-6" />;
      case 'Minimize2': return <Minimize2 className="w-6 h-6" />;
      case 'Stamp': return <Stamp className="w-6 h-6" />;
      case 'Hash': return <Hash className="w-6 h-6" />;
      case 'ImageIcon': return <ImageIcon className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-10">
      
      {/* Top Header Banner (Inspired by Bandai Namco roster header layout) */}
      <div className="space-y-4 pt-4 border-b border-white/10 pb-8">
        
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% EN TU NAVEGADOR // PRIVADO Y SEGURO</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight">
              HERRAMIENTAS <span className="text-5xl sm:text-7xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.45)] inline-block mx-1">PDF</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400">
                100% GRATIS Y PRIVADAS
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2 max-w-xl">
              Edita organiza comprime divide y firma directo en tu navegador con total privacidad.
            </p>
          </div>

          {/* Search bar with faceted cut */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar herramienta (ej. editar, organizar)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-400 faceted-cut text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition"
            />
          </div>
        </div>

        {/* Category Filters (Slanted tabs) */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'organize', label: 'Organizar & Dividir' },
            { id: 'edit', label: 'Edición & Texto' },
            { id: 'optimize', label: 'Optimización' },
            { id: 'convert', label: 'Conversión' },
            { id: 'security', label: 'Seguridad' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`slanted-tab px-4 py-2 text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700/80 border border-white/15'
              }`}
            >
              <span className="slanted-tab-inner inline-block">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Roster Grid (Faceted Cards layout inspired by Bandai Namco) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group faceted-card p-6 flex flex-col justify-between cursor-pointer"
          >
            {/* Card Content */}
            <div>
              {/* Header row: Number and Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="font-mono text-sm font-black text-amber-400/80">
                  #{tool.number}
                </span>

                {tool.badgeText && (
                  <span className="slanted-tab px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <span className="slanted-tab-inner inline-block">{tool.badgeText}</span>
                  </span>
                )}
              </div>

              {/* Icon & Title */}
              <div className="my-5 flex items-center gap-4">
                <div className="relative w-14 h-14 bg-[#0a0e1a] p-1 faceted-cut border border-white/10 shadow-md group-hover:border-amber-400/60 transition-all">
                  <div className={`w-full h-full bg-gradient-to-tr ${tool.color} flex items-center justify-center text-slate-950 font-bold group-hover:scale-105 transition-transform duration-300`}>
                    {getToolIcon(tool.icon)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {tool.title}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {tool.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {tool.description}
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                Abrir herramienta
              </span>

              <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all duration-200">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Pillars Banner */}
      <div className="bg-[#090d16] border border-white/10 faceted-cut p-6 sm:p-8 relative shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 faceted-cut flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase">Velocidad Inmediata</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sin tiempos de espera ni subidas a la nube. Procesamiento instantáneo en tu RAM.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 faceted-cut flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase">Privacidad Total</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tus documentos nunca salen de tu dispositivo. Ningún servidor externo tiene acceso.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/20 faceted-cut flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase">Totalmente Libre</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sin planes de suscripción, sin límites diarios de archivos y sin marcas de agua forzadas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trojan Horse Agency & Creator Banner (PizzIA & Luis Lasa) */}
      <div className="faceted-card p-6 sm:p-8 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-amber-400/40 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl shadow-amber-500/5">
        <div className="space-y-2.5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INGENIERÍA DE SOFTWARE & IA</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            ¿Buscas una solución web, SaaS o sistema inteligente a medida?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            PizzDF es un proyecto libre creado por <a href="https://luislasa.dev" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline font-bold inline-flex items-center gap-0.5">Luis Lasa <ExternalLink className="w-3 h-3 inline" /></a> y el equipo de <a href="https://pizzia.org" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline font-bold inline-flex items-center gap-0.5">PizzIA <ExternalLink className="w-3 h-3 inline" /></a>. Construimos plataformas digitales de alto rendimiento, productos SaaS escalables y agentes de inteligencia artificial para empresas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="https://pizzia.org"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Conoce PizzIA.org</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://luislasa.dev"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/20 text-slate-100 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <span>luislasa.dev</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};