import React, { useEffect, useRef, useState } from 'react';
import { takeStagedFiles } from '../../utils/stagedFiles';
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

  useEffect(() => {
    const staged = takeStagedFiles();
    if (staged && staged.length > 0) {
      onFilesSelected(multiple ? staged : [staged[0]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="drop-area bg-white p-10 sm:p-14 cursor-pointer"
        data-over={isDragging}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-start gap-5">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl leading-tight text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 max-w-[48ch]">{subtitle}</p>
          </div>
          <button type="button" className="btn-primary-sharp px-6 py-2.5 text-sm">
            Elegir archivo{multiple ? 's' : ''}
          </button>
        </div>
      </div>

      {allowSample && accept.includes('pdf') && (
        <p className="text-sm text-slate-600">
          ¿No tienes un PDF a mano?{' '}
          <button
            type="button"
            onClick={createSamplePdf}
            className="underline underline-offset-4 text-slate-900 hover:text-[var(--gold)] cursor-pointer"
          >
            Prueba con un documento de ejemplo
          </button>
        </p>
      )}
    </div>
  );
};
