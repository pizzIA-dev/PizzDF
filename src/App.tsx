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

const VALID_TOOLS: ToolId[] = ['dashboard', 'organize', 'editor', 'merge', 'split', 'compress', 'watermark', 'page-numbers', 'pdf-to-img', 'img-to-pdf'];

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
    return VALID_TOOLS.includes(hash) ? hash : 'dashboard';
  };

  const [currentTool, setCurrentToolState] = useState<ToolId>(getInitialTool);

  const setCurrentTool = (tool: ToolId) => {
    setCurrentToolState(tool);
    if (tool === 'dashboard') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.history.pushState(null, '', '#' + tool);
    }
    window.scrollTo({ top: 0 });
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as ToolId;
      setCurrentToolState(VALID_TOOLS.includes(hash) ? hash : 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderActiveTool = () => {
    const back = () => setCurrentTool('dashboard');
    switch (currentTool) {
      case 'organize':
        return <OrganizeTool onBack={back} />;
      case 'editor':
        return <EditorTool onBack={back} />;
      case 'merge':
        return <MergeTool onBack={back} />;
      case 'split':
        return <SplitTool onBack={back} />;
      case 'compress':
        return <CompressTool onBack={back} />;
      case 'watermark':
        return <WatermarkTool onBack={back} />;
      case 'page-numbers':
        return <PageNumberTool onBack={back} />;
      case 'pdf-to-img':
        return <PdfToImageTool onBack={back} />;
      case 'img-to-pdf':
        return <ImageToPdfTool onBack={back} />;
      default:
        return <Dashboard onSelectTool={setCurrentTool} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--desk)] text-slate-900 flex flex-col overflow-x-hidden">
      {showBanner && (
        <aside
          aria-label="Aviso de apoyo voluntario"
          className="bg-white border-b border-[var(--rule)] px-5 py-2 text-[13px] text-slate-700"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <p>
              PizzDF es gratis y se sostiene con aportes voluntarios.{' '}
              <button
                type="button"
                onClick={() => setShowDonation(true)}
                className="underline underline-offset-4 decoration-[var(--gold)] decoration-2 text-slate-900 hover:text-[var(--gold)] cursor-pointer"
              >
                Apoyar
              </button>
            </p>
            <button
              type="button"
              onClick={handleDismissBanner}
              aria-label="Cerrar aviso"
              className="text-lg leading-none text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ×
            </button>
          </div>
        </aside>
      )}

      <Header currentTool={currentTool} onSelectTool={setCurrentTool} onOpenDonation={() => setShowDonation(true)} />

      <main className="flex-1 pb-16">{renderActiveTool()}</main>

      <footer className="border-t border-[var(--rule)] py-8 text-sm text-slate-600">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <p>
            Hecho por{' '}
            <a href="https://pizzia.org" target="_blank" rel="noreferrer" className="underline underline-offset-4 text-slate-900 hover:text-[var(--gold)]">
              PizzIA
            </a>{' '}
            y{' '}
            <a href="https://luislasa.dev" target="_blank" rel="noreferrer" className="underline underline-offset-4 text-slate-900 hover:text-[var(--gold)]">
              Luis Lasa
            </a>
            .
          </p>
          <p className="font-mono text-xs">pizzdf.com · {new Date().getFullYear()} · tus archivos se quedan en tu navegador</p>
        </div>
      </footer>

      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </div>
  );
}

export default App;