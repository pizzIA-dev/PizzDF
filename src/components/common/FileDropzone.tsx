import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  allowSample?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  accept = 'application/pdf',
  multiple = false,
  title = 'Selecciona o arrastra tus archivos aquí',
  subtitle = 'Tus documentos se procesan de forma privada y local en tu navegador',
  allowSample = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? fileList : [fileList[0]]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      onFilesSelected(multiple ? fileList : [fileList[0]]);
    }
  };

  const createSamplePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Page 1
    const p1 = pdfDoc.addPage([595.28, 841.89]);
    p1.drawText('Documento de Prueba - PizzDF', {
      x: 50,
      y: 750,
      size: 24,
      font,
      color: rgb(0.9, 0.4, 0.1),
    });
    p1.drawText('Página 1: Este es un documento de prueba para verificar las herramientas.', {
      x: 50,
      y: 700,
      size: 13,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    p1.drawText('Puedes reordenar, rotar, editar, comprimir, firmar o estampar sellos en este documento.', {
      x: 50,
      y: 670,
      size: 11,
      font: bodyFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Page 2
    const p2 = pdfDoc.addPage([595.28, 841.89]);
    p2.drawText('Segunda Página - PizzDF', {
      x: 50,
      y: 750,
      size: 22,
      font,
      color: rgb(0.2, 0.4, 0.8),
    });
    p2.drawText('Página 2: Prueba a rotar esta página o a moverla a otra posición.', {
      x: 50,
      y: 700,
      size: 13,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Page 3
    const p3 = pdfDoc.addPage([595.28, 841.89]);
    p3.drawText('Tercera Página - PizzDF', {
      x: 50,
      y: 750,
      size: 22,
      font,
      color: rgb(0.1, 0.7, 0.3),
    });
    p3.drawText('Página 3: Puedes eliminar esta página o extraerla con la herramienta Dividir.', {
      x: 50,
      y: 700,
      size: 13,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    const pdfBytes = await pdfDoc.save();
    const sampleBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const sampleFile = new File([sampleBlob], 'ejemplo_pizzdf.pdf', { type: 'application/pdf' });
    onFilesSelected([sampleFile]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 faceted-cut p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-amber-400 bg-amber-500/15 scale-[1.01] shadow-[0_0_30px_rgba(245,158,11,0.5)]'
            : 'border-slate-300/90 bg-white hover:bg-amber-50/20 hover:border-amber-400 hover:shadow-md shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-[#0e1424] border border-amber-500/30 faceted-cut flex items-center justify-center shadow-md">
            <UploadCloud className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">{subtitle}</p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="btn-primary-sharp px-8 py-3 text-xs"
            >
              Seleccionar Archivo{multiple ? 's' : ''}
            </button>
          </div>
        </div>
      </div>

      {allowSample && accept.includes('pdf') && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={createSamplePdf}
            className="btn-secondary-sharp px-4 py-2 text-xs flex items-center gap-2 text-amber-300 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>¿No tienes un PDF a mano? Cargar documento de prueba</span>
          </button>
        </div>
      )}
    </div>
  );
};
