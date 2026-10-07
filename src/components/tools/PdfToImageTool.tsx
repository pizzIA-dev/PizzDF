import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Archive,
  Layers
} from 'lucide-react';
import { FileDropzone } from '../common/FileDropzone';
import { ToastNotification, type ToastMessage } from '../common/ToastNotification';
import { pdfjsLib, downloadBlob } from '../../utils/pdfHelper';
import JSZip from 'jszip';

interface ConvertedImage {
  pageNum: number;
  dataUrl: string;
}

export const PdfToImageTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'error' | 'success' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [scale, setScale] = useState(2.0); // 2x high-res
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      const totalPages = pdf.numPages;
      const converted: ConvertedImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          const mime = format === 'png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, 0.92);
          converted.push({ pageNum: i, dataUrl });
        }
      }

      setImages(converted);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al convertir el PDF en imágenes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = (img: ConvertedImage) => {
    const ext = format === 'png' ? 'png' : 'jpg';
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `${file?.name.replace('.pdf', '')}_pagina_${img.pageNum}.${ext}`;
    a.click();
  };

  const handleDownloadAllZip = async () => {
    if (images.length === 0 || !file) return;
    setZipping(true);

    try {
      const zip = new JSZip();
      const ext = format === 'png' ? 'png' : 'jpg';
      const baseName = file.name.replace('.pdf', '');

      images.forEach((img) => {
        // extract base64 data
        const base64Data = img.dataUrl.split(',')[1];
        zip.file(`${baseName}_pagina_${img.pageNum}.${ext}`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${baseName}_imagenes.zip`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al comprimir las imágenes en ZIP.');
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              PDF a Imágenes
            </h2>
            <p className="text-xs text-slate-600">
              Convierte cada página en imágenes nítidas de alta resolución (JPG o PNG) y descárgalas en ZIP.
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFile(null);
                setImages([]);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-950 shadow-sm transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cambiar Archivo
            </button>

            {images.length > 0 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={zipping}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {zipping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Empaquetando ZIP...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Descargar Todo en ZIP ({images.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {!file ? (
        <div className="py-12">
          <FileDropzone
            onFilesSelected={handleFileSelected}
            title="Sube el PDF que deseas convertir a imagen"
            subtitle="Cada página será renderizada con nitidez Retina lista para compartir"
          />
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-700 text-sm font-medium">Renderizando páginas en alta resolución...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {images.map((img) => (
              <div
                key={img.pageNum}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:border-amber-400 transition shadow-sm"
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-slate-800">Pág. {img.pageNum}</span>
                  <button
                    onClick={() => handleDownloadSingle(img)}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 border border-slate-200 transition"
                    title="Descargar esta imagen"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-100/70 rounded-xl p-2 flex items-center justify-center min-h-[160px] overflow-hidden border border-slate-200/60">
                  <img
                    src={img.dataUrl}
                    alt={`Página ${img.pageNum}`}
                    className="max-h-[150px] w-auto object-contain rounded shadow"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
</div>
  );
};
