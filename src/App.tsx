import React, { useState } from 'react';
import type { ToolId } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OrganizeTool } from './components/tools/OrganizeTool';
import { EditorTool } from './components/tools/EditorTool';
import { MergeTool } from './components/tools/MergeTool';
import { SplitTool } from './components/tools/SplitTool';
import { CompressTool } from './components/tools/CompressTool';
import { WatermarkTool } from './components/tools/WatermarkTool';
import { PageNumberTool } from './components/tools/PageNumberTool';
import { PdfToImageTool } from './components/tools/PdfToImageTool';
import { ImageToPdfTool } from './components/tools/ImageToPdfTool';
import { DonationModal } from './components/common/DonationModal';
import { Pizza, ShieldCheck, Zap, Heart, Coffee, X, ExternalLink } from 'lucide-react';

export function App() {
  const [showDonation, setShowDonation] = useState(false);
  const [showBanner, setShowBanner] = useState(() => {
    try {
      return localStorage.getItem('pizzdf_donation_banner_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissBanner = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('pizzdf_donation_banner_dismissed', 'true');
    } catch {}
  };
  const getInitialTool = (): ToolId => {
    const hash = window.location.hash.replace('#', '') as ToolId;
    const validTools: ToolId[] = ['dashboard', 'organize', 'editor', 'merge', 'split', 'compress', 'watermark', 'page-numbers', 'pdf-to-img', 'img-to-pdf'];
    return validTools.includes(hash) ? hash : 'dashboard';
  };

  const [currentTool, setCurrentToolState] = useState<ToolId>(getInitialTool);

  const setCurrentTool = (tool: ToolId) => {
    setCurrentToolState(tool);
    if (tool === 'dashboard') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.history.pushState(null, '', '#' + tool);
    }
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as ToolId;
      const validTools: ToolId[] = ['dashboard', 'organize', 'editor', 'merge', 'split', 'compress', 'watermark', 'page-numbers', 'pdf-to-img', 'img-to-pdf'];
      setCurrentToolState(validTools.includes(hash) ? hash : 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderActiveTool = () => {
    switch (currentTool) {
      case 'organize':
        return <OrganizeTool onBack={() => setCurrentTool('dashboard')} />;
      case 'editor':
        return <EditorTool onBack={() => setCurrentTool('dashboard')} />;
      case 'merge':
        return <MergeTool onBack={() => setCurrentTool('dashboard')} />;
      case 'split':
        return <SplitTool onBack={() => setCurrentTool('dashboard')} />;
      case 'compress':
        return <CompressTool onBack={() => setCurrentTool('dashboard')} />;
      case 'watermark':
        return <WatermarkTool onBack={() => setCurrentTool('dashboard')} />;
      case 'page-numbers':
        return <PageNumberTool onBack={() => setCurrentTool('dashboard')} />;
      case 'pdf-to-img':
        return <PdfToImageTool onBack={() => setCurrentTool('dashboard')} />;
      case 'img-to-pdf':
        return <ImageToPdfTool onBack={() => setCurrentTool('dashboard')} />;
      default:
        return <Dashboard onSelectTool={setCurrentTool} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Top Donation Banner (Discreet & elegant appeal) */}
      {showBanner && (
        <aside aria-label="Aviso de apoyo voluntario" className="relative z-50 bg-amber-50/95 border-b border-amber-200/90 px-4 py-2 text-xs text-slate-800 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="w-6 h-6 rounded-lg bg-amber-200/60 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
                <Coffee className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] sm:text-xs text-slate-800">
                <strong className="text-slate-950 font-bold">PizzDF es 100% gratuito, privado y sin límites.</strong>{' '}
                <span className="text-slate-600 hidden md:inline">
                  Tus archivos se procesan en tu memoria RAM sin servidores externos. Si te ahorra tiempo,
                </span>{' '}
                <span className="text-amber-900 font-semibold">puedes apoyar el proyecto con un aporte voluntario.</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowDonation(true)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3 h-3 fill-slate-950" />
                <span>Apoyar</span>
              </button>

              <button
                onClick={handleDismissBanner}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-amber-100/80 transition cursor-pointer"
                title="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Top Header */}
      <Header currentTool={currentTool} onSelectTool={setCurrentTool} onOpenDonation={() => setShowDonation(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 relative z-10">
        {renderActiveTool()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/95 backdrop-blur-md py-8 text-xs text-slate-600 relative z-10 border-t border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 faceted-cut flex items-center justify-center">
                <Pizza className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-wide">
                  <span className="text-amber-400 font-black">P</span>izz<span className="text-amber-400 font-black">DF</span>
                </span>
                <span className="text-slate-500 mx-2">•</span>
                <span className="text-slate-400">Suite de herramientas PDF 100% privadas y en tu navegador</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <a
                href="https://pizzia.org"
                target="_blank"
                rel="noreferrer"
                className="text-amber-600 hover:text-amber-700 transition flex items-center gap-1.5 hover:underline"
              >
                <span>Desarrollado por PizzIA</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-700">|</span>
              <a
                href="https://luislasa.dev"
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:text-slate-950 transition flex items-center gap-1.5 hover:underline"
              >
                <span>Luis Lasa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => setShowDonation(true)}
                className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
                <span>Apoyar el proyecto</span>
              </button>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>100% CLIENT-SIDE • CERO SERVIDORES • PRIVACIDAD ABSOLUTA</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} PizzDF • Dominio oficial: </span>
              <a href="https://pizzdf.com" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline font-bold">pizzdf.com</a>
            </div>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </div>
  );
}

export default App;
