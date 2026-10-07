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
import { Pizza, ShieldCheck, Zap, Heart } from 'lucide-react';

export function App() {
  const [showDonation, setShowDonation] = useState(false);
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Top Header */}
      <Header currentTool={currentTool} onSelectTool={setCurrentTool} onOpenDonation={() => setShowDonation(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 relative z-10">
        {renderActiveTool()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070a12]/95 backdrop-blur-md py-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 faceted-cut flex items-center justify-center">
              <Pizza className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-bold text-white tracking-wide">
              <span className="text-amber-400 font-black">P</span>izz<span className="text-amber-400 font-black">DF</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Suite de edición y gestión de documentos PDF</span>
          </div>

          <div className="flex items-center gap-5 font-mono text-[11px]">
            <button
              onClick={() => setShowDonation(true)}
              className="text-amber-400 hover:text-amber-300 transition font-bold flex items-center gap-1.5 font-sans hover:underline cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
              <span>Apoyar el proyecto</span>
            </button>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% EN TU NAVEGADOR</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">ILIMITADO Y GRATUITO</span>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </div>
  );
}

export default App;
