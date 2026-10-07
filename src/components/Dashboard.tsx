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
  ArrowRight,
  Search,
  ExternalLink
} from 'lucide-react';
import type { ToolId, ToolDef } from '../types';

interface DashboardProps {
  onSelectTool: (tool: ToolId) => void;
}

interface ToolItem extends ToolDef {
  badgeText?: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'editor',
    title: 'Editor de PDF',
    description: 'Añade texto, firmas digitales, sellos, formas, dibujo libre y resaltado.',
    category: 'edit',
    badgeText: 'POPULAR',
    icon: 'FileEdit',
    color: 'from-amber-500 to-yellow-400 text-slate-950',
  },
  {
    id: 'organize',
    title: 'Organizar Páginas',
    description: 'Reordena arrastrando, rota, duplica o elimina páginas en tiempo real.',
    category: 'organize',
    badgeText: 'ESENCIAL',
    icon: 'Layers',
    color: 'from-orange-500 to-amber-400 text-slate-950',
  },
  {
    id: 'merge',
    title: 'Unir PDFs',
    description: 'Combina múltiples documentos PDF en el orden exacto que necesitas.',
    category: 'organize',
    badgeText: 'RÁPIDO',
    icon: 'Files',
    color: 'from-amber-400 to-orange-400 text-slate-950',
  },
  {
    id: 'split',
    title: 'Dividir y Separar',
    description: 'Extrae páginas seleccionadas o divide todo el documento en archivos individuales.',
    category: 'organize',
    icon: 'Scissors',
    color: 'from-indigo-500 to-purple-500 text-white',
  },
  {
    id: 'compress',
    title: 'Comprimir PDF',
    description: 'Reduce el peso de tus documentos optimizando recursos directamente en tu equipo.',
    category: 'optimize',
    icon: 'Minimize2',
    color: 'from-emerald-500 to-teal-400 text-white',
  },
  {
    id: 'watermark',
    title: 'Marca de Agua',
    description: 'Inserta texto de seguridad con control de opacidad, rotación y posición.',
    category: 'security',
    icon: 'Stamp',
    color: 'from-blue-500 to-cyan-400 text-white',
  },
  {
    id: 'page-numbers',
    title: 'Numerar Páginas',
    description: 'Añade paginación correlativa con formato y alineación personalizada.',
    category: 'edit',
    icon: 'Hash',
    color: 'from-violet-500 to-indigo-500 text-white',
  },
  {
    id: 'pdf-to-img',
    title: 'PDF a Imágenes',
    description: 'Convierte cada página en imágenes JPG o PNG en alta resolución.',
    category: 'convert',
    icon: 'ImageIcon',
    color: 'from-pink-500 to-rose-400 text-white',
  },
  {
    id: 'img-to-pdf',
    title: 'Imágenes a PDF',
    description: 'Transforma fotos e imágenes sueltas en un documento PDF ordenado.',
    category: 'convert',
    icon: 'ImageIcon',
    color: 'from-amber-500 to-amber-600 text-white',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch = tool.title.toLowerCase().includes(search.toLowerCase()) ||
                          tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileEdit': return <FileEdit className="w-6 h-6" />;
      case 'Layers': return <Layers className="w-6 h-6" />;
      case 'Files': return <Files className="w-6 h-6" />;
      case 'Scissors': return <Scissors className="w-6 h-6" />;
      case 'Minimize2': return <Minimize2 className="w-6 h-6" />;
      case 'Stamp': return <Stamp className="w-6 h-6" />;
      case 'Hash': return <Hash className="w-6 h-6" />;
      case 'ImageIcon': return <ImageIcon className="w-6 h-6" />;
      default: return <FileEdit className="w-6 h-6" />;
    }
  };

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'organize', label: 'Organizar' },
    { id: 'edit', label: 'Editar' },
    { id: 'optimize', label: 'Optimizar' },
    { id: 'convert', label: 'Convertir' },
    { id: 'security', label: 'Seguridad' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 relative z-10">
      
      {/* Clean, Streamlined Hero Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% en tu navegador • Cero servidores • Máxima privacidad</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Herramientas <span className="text-amber-500">PDF</span> libres y privadas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 max-w-xl">
              Edita, organiza, comprime, une y divide documentos al instante sin registros ni límites.
            </p>
          </div>

          {/* Clean Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar herramienta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm transition"
            />
          </div>
        </div>

        {/* Clean Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group relative bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between pb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center shadow-sm`}>
                  {getToolIcon(tool.icon)}
                </div>

                {tool.badgeText && (
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    {tool.badgeText}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors mt-2">
                {tool.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                {tool.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors">
              <span>Abrir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Trojan Horse Agency & Creator Banner (PizzIA & Luis Lasa) */}
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>INGENIERÍA DE SOFTWARE & IA</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            ¿Buscas una solución web, SaaS o sistema inteligente a medida?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            PizzDF es un proyecto libre creado por <a href="https://luislasa.dev" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline font-bold inline-flex items-center gap-0.5">Luis Lasa <ExternalLink className="w-3 h-3 inline" /></a> y el equipo de <a href="https://pizzia.org" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline font-bold inline-flex items-center gap-0.5">PizzIA <ExternalLink className="w-3 h-3 inline" /></a>. Construimos plataformas digitales de alto rendimiento, productos SaaS escalables y agentes de inteligencia artificial para empresas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="https://pizzia.org"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Conoce PizzIA.org</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://luislasa.dev"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>luislasa.dev</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

    </div>
  );
};
