import { StampCanvas } from '../../utils/stampRenderer';
import React, { useRef, useEffect, useState } from 'react';
import { 
  Trash2, 
  BringToFront, 
  SendToBack, 
  Bold, 
  Italic, 
  Underline, 
  Plus, 
  Minus,
  Grid,
  Columns,
  Rows,
  Copy,
  GripHorizontal
} from 'lucide-react';
import type { PageAnnotation, TableData } from './EditorTool';

interface PDFPageViewProps {
  pageNumber: number;
  pdfDoc: any;
  scale: number;
  annotations: PageAnnotation[];
  selectedAnnId: string | null;
  onSelectAnn: (id: string | null) => void;
  onUpdateAnn: (ann: PageAnnotation) => void;
  onDeleteAnn: (id: string) => void;
  onAddAnnotation: (ann: PageAnnotation) => void;
  onCopyAnn: (ann: PageAnnotation) => void;
  activeTool: string;
  penColor: string;
  penWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  selectedStampPreset: any | null;
  containerRefCallback: (el: HTMLDivElement | null) => void;
}

const FONT_OPTIONS = [
  { label: 'Inter (Sans-Serif)', value: "'Inter', sans-serif" },
  { label: 'Playfair (Serif)', value: "'Playfair Display', serif" },
  { label: 'Courier (Monospace)', value: "'Courier Prime', monospace" },
  { label: 'Dancing Script (Cursiva)', value: "'Dancing Script', cursive" },
  { label: 'Oswald (Moderna)', value: "'Oswald', sans-serif" },
  { label: 'Caveat (Casual)', value: "'Caveat', cursive" },
];

export const PDFPageView: React.FC<PDFPageViewProps> = ({
  pageNumber,
  pdfDoc,
  scale,
  annotations,
  selectedAnnId,
  onSelectAnn,
  onUpdateAnn,
  onDeleteAnn,
  onAddAnnotation,
  onCopyAnn,
  activeTool,
  penColor,
  penWidth,
  highlighterColor,
  highlighterWidth,
  selectedStampPreset,
  containerRefCallback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageFrameRef = useRef<HTMLDivElement | null>(null);

  const [pageDims, setPageDims] = useState<{ width: number; height: number }>({ width: 595 * scale, height: 842 * scale });

  // Freehand drawing / highlighting state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  // Custom cursor position for pen / highlighter circular tip
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });


  // Dragging state
  const [draggingAnnId, setDraggingAnnId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });

  // Resizing state
  const [resizingAnnId, setResizingAnnId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw'>('se');
  const [resizeStart, setResizeStart] = useState<{ clientX: number; clientY: number; width: number; height: number; aspectRatio: number }>({
    clientX: 0,
    clientY: 0,
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  // Render PDF page to canvas
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        setPageDims({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        if (!canvas || isCancelled) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        if (highlightCanvasRef.current) {
          highlightCanvasRef.current.width = viewport.width;
          highlightCanvasRef.current.height = viewport.height;
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNumber}:`, err);
      }
    };

    renderPage();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, scale]);

  // Precise mouse coordinates mapped to canvas dimensions
  const getCanvasCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = pageFrameRef.current || containerRef.current;
    if (!frame) return { x: 0, y: 0, relX: 0, relY: 0 };
    const rect = frame.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    return {
      x: pixelX,
      y: pixelY,
      relX: Math.max(0, Math.min(1, pixelX / Math.max(1, rect.width))),
      relY: Math.max(0, Math.min(1, pixelY / Math.max(1, rect.height))),
    };
  };

  // Click on background
  const handlePageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y, relX, relY } = getCanvasCoords(e);

        // Continuous Stamp Mode
    if (activeTool === 'stamp' && selectedStampPreset) {
      if (selectedStampPreset.isImage && selectedStampPreset.imageData) {
        const newStampImg: PageAnnotation = {
          id: 'ann-' + Date.now() + '-' + Math.random(),
          type: 'image',
          pageIndex: pageNumber - 1,
          x: Math.max(0, relX - 0.1),
          y: Math.max(0, relY - 0.08),
          width: 0.22,
          height: 0.16,
          zIndex: 25,
          imageData: selectedStampPreset.imageData,
        };
        onAddAnnotation(newStampImg);
        onSelectAnn(newStampImg.id);
        return;
      }
      const newStampAnn: PageAnnotation = {
        id: 'ann-' + Date.now() + '-' + Math.random(),
        type: 'stamp',
        pageIndex: pageNumber - 1,
        x: Math.max(0, relX - 0.12),
        y: Math.max(0, relY - 0.04),
        width: 0.26,
        height: 0.08,
        zIndex: 25,
        stampLabel: selectedStampPreset.label,
        color: selectedStampPreset.color,
      };
      onAddAnnotation(newStampAnn);
      onSelectAnn(newStampAnn.id);
      return;
    }

    if (activeTool === 'select') {
      onSelectAnn(null);
      return;
    }

    // Direct Word / PowerPoint text creation
    if (activeTool === 'text') {
      const newTextAnn: PageAnnotation = {
        id: `ann-${Date.now()}-${Math.random()}`,
        type: 'text',
        pageIndex: pageNumber - 1,
        x: relX,
        y: relY,
        width: 0.35,
        height: 0.08,
        zIndex: 20,
        text: 'Escribe tu texto aquí',
        fontSize: 18,
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif",
        isBold: false,
        isItalic: false,
        isUnderline: false,
      };
      onAddAnnotation(newTextAnn);
      onSelectAnn(newTextAnn.id);
      return;
    }

    // Direct Excel Table creation
    if (activeTool === 'table') {
      const newTableAnn: PageAnnotation = {
        id: `ann-${Date.now()}-${Math.random()}`,
        type: 'table',
        pageIndex: pageNumber - 1,
        x: relX,
        y: relY,
        width: 0.45,
        height: 0.16,
        zIndex: 20,
        tableData: {
          rows: 3,
          cols: 3,
          cells: [
            ['Encabezado 1', 'Encabezado 2', 'Encabezado 3'],
            ['Dato A1', 'Dato A2', 'Dato A3'],
            ['Dato B1', 'Dato B2', 'Dato B3'],
          ],
          headerBg: '#0f172a',
          borderColor: '#94a3b8',
          textColor: '#0f172a',
        },
      };
      onAddAnnotation(newTableAnn);
      onSelectAnn(newTableAnn.id);
      return;
    }

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setIsDrawing(true);
      setCurrentPoints([{ x, y }]);
    }
  };

  const handlePageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'draw' || activeTool === 'highlight') {
      const { x, y } = getCanvasCoords(e);
      setCursorPos({ x, y, visible: true });
    }
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);

    setCurrentPoints(prev => [...prev, { x, y }]);

    // Live preview stroke on highlight canvas
    const canvas = highlightCanvasRef.current;
    if (canvas && currentPoints.length > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        if (activeTool === 'highlight') {
          ctx.strokeStyle = highlighterColor;
          ctx.lineWidth = highlighterWidth * scale;
          ctx.globalAlpha = 0.38;
        } else {
          ctx.strokeStyle = penColor;
          ctx.lineWidth = penWidth * scale;
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const last = currentPoints[currentPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

    const handlePageMouseLeave = () => {
    setCursorPos(prev => ({ ...prev, visible: false }));
    if (isDrawing) {
      handlePageMouseUp();
    }
  };

  const handlePageMouseUp = () => {
    if (isDrawing && currentPoints.length > 1) {
      // Compute precise bounding box for draw or highlight
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      currentPoints.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });

      const isHighlighter = activeTool === 'highlight';
      const effectiveW = isHighlighter ? highlighterWidth : penWidth;
      const pad = (effectiveW * scale) / 2 + 6;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(pageDims.width, maxX + pad);
      maxY = Math.min(pageDims.height, maxY + pad);

      const w = Math.max(25, maxX - minX);
      const h = Math.max(25, maxY - minY);

      const relativePoints = currentPoints.map(p => ({
        x: (p.x - minX) / w,
        y: (p.y - minY) / h,
      }));

      const newStrokeAnn: PageAnnotation = {
        id: 'ann-' + Date.now() + '-' + Math.random(),
        type: isHighlighter ? 'highlight' : 'draw',
        pageIndex: pageNumber - 1,
        x: minX / pageDims.width,
        y: minY / pageDims.height,
        width: w / pageDims.width,
        height: h / pageDims.height,
        zIndex: isHighlighter ? 12 : 16,
        color: isHighlighter ? highlighterColor : penColor,
        strokeWidth: effectiveW,
        opacity: isHighlighter ? 0.38 : 1,
        points: relativePoints,
      };

      onAddAnnotation(newStrokeAnn);
      if (!isHighlighter) { onSelectAnn(newStrokeAnn.id); }

      if (highlightCanvasRef.current) {
        const ctx = highlightCanvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, pageDims.width, pageDims.height);
      }
    }
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  // Dragging handlers
  const handleStartDrag = (ann: PageAnnotation, e: React.MouseEvent) => {
    if (ann.type === 'highlight') return;
    e.stopPropagation();
    onSelectAnn(ann.id);
    setDraggingAnnId(ann.id);
    setDragStartPos({ clientX: e.clientX, clientY: e.clientY });
  };

  // Resizing handlers
  const handleStartResize = (ann: PageAnnotation, handle: 'se' | 'sw' | 'ne' | 'nw', e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingAnnId(ann.id);
    setResizeHandle(handle);
    const currW = ann.width * pageDims.width;
    const currH = (ann.height || 0.1) * pageDims.height;
    const initialRatio = Math.max(0.1, currW / Math.max(1, currH));
    setResizeStart({
      clientX: e.clientX,
      clientY: e.clientY,
      width: currW,
      height: currH,
      aspectRatio: initialRatio,
    });
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (draggingAnnId) {
        const target = annotations.find(a => a.id === draggingAnnId);
        if (!target) return;
        const deltaX = (e.clientX - dragStartPos.clientX) / pageDims.width;
        const deltaY = (e.clientY - dragStartPos.clientY) / pageDims.height;
        const newX = Math.max(0, Math.min(1 - target.width, target.x + deltaX));
        const newY = Math.max(0, Math.min(1 - target.height, target.y + deltaY));
        onUpdateAnn({ ...target, x: newX, y: newY });
        setDragStartPos({ clientX: e.clientX, clientY: e.clientY });
      } else if (resizingAnnId) {
        const target = annotations.find(a => a.id === resizingAnnId);
        if (!target) return;
        const deltaX = e.clientX - resizeStart.clientX;
        const deltaY = e.clientY - resizeStart.clientY;

        let newPixelW = Math.max(30, resizeStart.width + deltaX);
        let newPixelH = Math.max(20, resizeStart.height + deltaY);

        // If Shift is pressed, lock to initial aspect ratio!
        if (e.shiftKey && (resizeStart as any).aspectRatio > 0) {
          const ratio = (resizeStart as any).aspectRatio;
          newPixelH = newPixelW / ratio;
        }

        onUpdateAnn({
          ...target,
          width: newPixelW / pageDims.width,
          height: newPixelH / pageDims.height,
        });
      }
    };

    const handleWindowMouseUp = () => {
      setDraggingAnnId(null);
      setResizingAnnId(null);
    };

    if (draggingAnnId || resizingAnnId) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingAnnId, resizingAnnId, dragStartPos, resizeStart, annotations, pageDims]);

  // Layering
  const handleBringToFront = (ann: PageAnnotation) => {
    const maxZ = Math.max(10, ...annotations.map(a => a.zIndex || 10));
    onUpdateAnn({ ...ann, zIndex: maxZ + 1 });
  };

  const handleSendToBack = (ann: PageAnnotation) => {
    const minZ = Math.min(10, ...annotations.map(a => a.zIndex || 10));
    onUpdateAnn({ ...ann, zIndex: Math.max(1, minZ - 1) });
  };

  // Table manipulation (Add/remove rows & cols)
  const handleAddTableRow = (ann: PageAnnotation) => {
    if (!ann.tableData) return;
    const newCells = [...ann.tableData.cells];
    const newRow = Array(ann.tableData.cols).fill('Nuevo dato');
    newCells.push(newRow);
    onUpdateAnn({
      ...ann,
      tableData: {
        ...ann.tableData,
        rows: ann.tableData.rows + 1,
        cells: newCells,
      },
    });
  };

  const handleRemoveTableRow = (ann: PageAnnotation) => {
    if (!ann.tableData || ann.tableData.rows <= 1) return;
    const newCells = ann.tableData.cells.slice(0, -1);
    onUpdateAnn({
      ...ann,
      tableData: {
        ...ann.tableData,
        rows: ann.tableData.rows - 1,
        cells: newCells,
      },
    });
  };

  const handleAddTableCol = (ann: PageAnnotation) => {
    if (!ann.tableData) return;
    const newCells = ann.tableData.cells.map(row => [...row, 'Dato']);
    onUpdateAnn({
      ...ann,
      tableData: {
        ...ann.tableData,
        cols: ann.tableData.cols + 1,
        cells: newCells,
      },
    });
  };

  const handleRemoveTableCol = (ann: PageAnnotation) => {
    if (!ann.tableData || ann.tableData.cols <= 1) return;
    const newCells = ann.tableData.cells.map(row => row.slice(0, -1));
    onUpdateAnn({
      ...ann,
      tableData: {
        ...ann.tableData,
        cols: ann.tableData.cols - 1,
        cells: newCells,
      },
    });
  };

  const handleUpdateTableCell = (ann: PageAnnotation, r: number, c: number, value: string) => {
    if (!ann.tableData) return;
    const newCells = ann.tableData.cells.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? value : cell))
    );
    onUpdateAnn({
      ...ann,
      tableData: {
        ...ann.tableData,
        cells: newCells,
      },
    });
  };

  const pageItems = annotations.filter(a => a.pageIndex === pageNumber - 1);

  return (
    <div
      ref={el => {
        containerRef.current = el;
        containerRefCallback(el);
      }}
      className="flex flex-col items-center space-y-2 select-none"
    >
      {/* Page Header */}
      <div className="self-start px-3 py-1 rounded-md bg-white border border-slate-300 text-[11px] font-mono font-bold text-slate-700">
        Página {pageNumber}
      </div>

      {/* Page Viewport Frame */}
      <div
        ref={pageFrameRef}
        className={`relative shadow-2xl border border-slate-700/80 bg-white ${
          activeTool === 'draw' || activeTool === 'highlight' ? 'cursor-none' : ''
        }`}
        style={{ width: `${pageDims.width}px`, height: `${pageDims.height}px` }}
        onMouseDown={handlePageMouseDown}
        onMouseMove={handlePageMouseMove}
        onMouseUp={handlePageMouseUp}
        onMouseLeave={handlePageMouseLeave}
      >
                {/* Floating circular mouse tip for precise drawing / highlighting tracking */}
        {cursorPos.visible && (activeTool === 'draw' || activeTool === 'highlight') && (
          <div
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 border-2"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: `${(activeTool === 'highlight' ? highlighterWidth : penWidth) * scale}px`,
              height: `${(activeTool === 'highlight' ? highlighterWidth : penWidth) * scale}px`,
              backgroundColor: activeTool === 'highlight' ? highlighterColor : penColor,
              opacity: activeTool === 'highlight' ? 0.45 : 0.8,
              borderColor: '#ffffff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
            }}
          />
        )}

        {/* PDF Background Canvas */}
        <canvas ref={canvasRef} className="block bg-white" />

        {/* Live Drawing / Highlighting Preview SVG */}
        {isDrawing && currentPoints.length > 1 && (
          <svg
            className="absolute inset-0 pointer-events-none z-30"
            style={{ width: `${pageDims.width}px`, height: `${pageDims.height}px` }}
          >
            <path
              d={currentPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
              stroke={activeTool === 'highlight' ? highlighterColor : penColor}
              strokeWidth={(activeTool === 'highlight' ? highlighterWidth : penWidth) * scale}
              strokeOpacity={activeTool === 'highlight' ? 0.38 : 1}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Interactive Overlay Elements */}
        {pageItems.map(ann => {
          const isSelected = selectedAnnId === ann.id && ann.type !== 'highlight';
          const leftPx = ann.x * pageDims.width;
          const topPx = ann.y * pageDims.height;
          const widthPx = (ann.width || 0.25) * pageDims.width;
          const heightPx = (ann.height || 0.1) * pageDims.height;

          return (
            <div
              key={ann.id}
              onClick={e => {
                e.stopPropagation();
                if (ann.type !== 'highlight') {
                  onSelectAnn(ann.id);
                }
              }}
              onMouseDown={e => {
                if (ann.type !== 'highlight' && !(e.target as HTMLElement).isContentEditable) {
                  handleStartDrag(ann, e);
                }
              }}
              className={`absolute transition-shadow ${ann.type === 'highlight' ? 'pointer-events-none' : ''} ${
                isSelected
                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent shadow-2xl rounded-sm'
                  : ann.type !== 'highlight' ? 'hover:ring-1 hover:ring-amber-400/60 hover:ring-dashed rounded-sm' : ''
              }`}
              style={{
                left: `${leftPx}px`,
                top: `${topPx}px`,
                width: `${widthPx}px`,
                minWidth: ann.type === 'text' ? `${widthPx}px` : undefined,
                maxWidth: ann.type === 'text' ? `${widthPx}px` : undefined,
                height: ann.type === 'text' ? undefined : `${heightPx}px`,
                zIndex: ann.zIndex || 10,
              }}
            >
              {/* Dedicated Drag Bar Header for easy moving */}
              {isSelected && (
                <div
                  onMouseDown={e => handleStartDrag(ann, e)}
                  className="absolute -top-7 left-0 right-0 h-6 bg-amber-400 text-slate-950 px-2 flex items-center justify-between rounded-t-md cursor-grab active:cursor-grabbing shadow-lg z-50 text-[10px] font-black uppercase tracking-wider select-none"
                  title="Arrastra para mover libremente este elemento"
                >
                  <div className="flex items-center gap-1">
                    <GripHorizontal className="w-3.5 h-3.5" />
                    <span>Mover {ann.type}</span>
                  </div>
                  <span className="text-[9px] opacity-80 lowercase font-mono">Shift = ratio</span>
                </div>
              )}

              {/* Floating Inspector Toolbar when selected */}
              {isSelected && (
                <div
                  className="absolute -top-14 left-0 z-50 bg-white/95 border border-slate-200 rounded-xl p-1.5 flex items-center gap-1.5 shadow-xl text-xs text-slate-800 backdrop-blur-xl"
                  onMouseDown={e => e.stopPropagation()}
                >
                  {/* Layer controls */}
                  <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
                    <button
                      onClick={() => handleBringToFront(ann)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-amber-600"
                      title="Traer al frente (Capa superior)"
                    >
                      <BringToFront className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSendToBack(ann)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-amber-600"
                      title="Enviar al fondo (Capa inferior)"
                    >
                      <SendToBack className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onCopyAnn(ann)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-amber-600"
                    title="Copiar elemento (Ctrl+C)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Text Properties */}
                  {ann.type === 'text' && (
                    <>
                      <select
                        value={ann.fontFamily || "'Inter', sans-serif"}
                        onChange={e => onUpdateAnn({ ...ann, fontFamily: e.target.value })}
                        className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none"
                      >
                        {FONT_OPTIONS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 px-1 bg-slate-100 rounded border border-slate-200">
                        <input
                          type="number"
                          min="8"
                          max="96"
                          value={ann.fontSize || 18}
                          onChange={e => onUpdateAnn({ ...ann, fontSize: Number(e.target.value) })}
                          className="w-10 bg-transparent text-center text-xs font-mono font-bold text-slate-800 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">pt</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => onUpdateAnn({ ...ann, isBold: !ann.isBold })}
                          className={`p-1.5 rounded text-xs font-black ${
                            ann.isBold ? 'bg-amber-400 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Negrita"
                        >
                          <Bold className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdateAnn({ ...ann, isItalic: !ann.isItalic })}
                          className={`p-1.5 rounded text-xs font-black ${
                            ann.isItalic ? 'bg-amber-400 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Cursiva"
                        >
                          <Italic className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdateAnn({ ...ann, isUnderline: !ann.isUnderline })}
                          className={`p-1.5 rounded text-xs font-black ${
                            ann.isUnderline ? 'bg-amber-400 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Subrayado"
                        >
                          <Underline className="w-3 h-3" />
                        </button>
                      </div>

                      <label className="flex items-center gap-1 p-1 hover:bg-slate-100 rounded cursor-pointer" title="Color de texto">
                        <input
                          type="color"
                          value={ann.color || '#000000'}
                          onChange={e => onUpdateAnn({ ...ann, color: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </label>
                    </>
                  )}

                  {/* Table Properties */}
                  {ann.type === 'table' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAddTableRow(ann)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold"
                        title="Añadir fila"
                      >
                        + Fila
                      </button>
                      <button
                        onClick={() => handleRemoveTableRow(ann)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold"
                        title="Quitar fila"
                      >
                        - Fila
                      </button>
                      <button
                        onClick={() => handleAddTableCol(ann)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold"
                        title="Añadir columna"
                      >
                        + Col
                      </button>
                      <button
                        onClick={() => handleRemoveTableCol(ann)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold"
                        title="Quitar columna"
                      >
                        - Col
                      </button>
                      <label className="flex items-center gap-1 p-1 hover:bg-slate-100 rounded cursor-pointer" title="Color de borde">
                        <input
                          type="color"
                          value={ann.tableData?.borderColor || '#94a3b8'}
                          onChange={e =>
                            onUpdateAnn({
                              ...ann,
                              tableData: { ...ann.tableData!, borderColor: e.target.value },
                            })
                          }
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </label>
                    </div>
                  )}

                  {/* Draw Properties */}
                  {ann.type === 'draw' && (
                    <>
                      <div className="flex items-center gap-1 px-1 bg-slate-100 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-400">Grosor:</span>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={ann.strokeWidth || 3}
                          onChange={e => onUpdateAnn({ ...ann, strokeWidth: Number(e.target.value) })}
                          className="w-8 bg-transparent text-center text-xs font-mono font-bold text-amber-300 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">px</span>
                      </div>
                      <label className="flex items-center gap-1 p-1 hover:bg-slate-100 rounded cursor-pointer" title="Color de trazo">
                        <input
                          type="color"
                          value={ann.color || '#dc2626'}
                          onChange={e => onUpdateAnn({ ...ann, color: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </label>
                    </>
                  )}

                  {/* Stamp Properties */}
                  {ann.type === 'stamp' && (
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="font-mono text-[10px] text-amber-400 font-bold">{ann.stampLabel}</span>
                      <label className="flex items-center gap-1 p-0.5 hover:bg-slate-100 rounded cursor-pointer" title="Color del sello">
                        <input
                          type="color"
                          value={ann.color || '#dc2626'}
                          onChange={e => onUpdateAnn({ ...ann, color: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </label>
                    </div>
                  )}

                  <div className="border-l border-white/15 pl-1.5">
                    <button
                      onClick={() => onDeleteAnn(ann.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
                      title="Eliminar elemento (SUPR)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Element Bodies */}
              {/* Word/PowerPoint style auto-expanding textarea */}
              {ann.type === 'text' && (
                <textarea
                  autoFocus
                  onFocus={e => {
                    if (e.target.value === 'Escribe tu texto aquí') {
                      e.target.select();
                    }
                  }}
                  placeholder="Escribe tu texto aquí..."
                  value={ann.text ?? ''}
                  rows={Math.max(1, (ann.text || '').split('\n').length)}
                  onChange={e => {
                    onUpdateAnn({ ...ann, text: e.target.value });
                  }}
                  onBlur={e => {
                    const textVal = e.target.value.trim();
                    if (!textVal) {
                      onDeleteAnn(ann.id);
                    }
                  }}
                  onMouseDown={e => e.stopPropagation()}
                  className="w-full bg-transparent resize-none border-0 outline-none p-1 placeholder:text-slate-400 placeholder:italic placeholder:font-normal cursor-text overflow-hidden"
                  style={{
                    color: ann.color || '#000',
                    fontFamily: ann.fontFamily || "'Inter', sans-serif",
                    fontSize: `${(ann.fontSize || 18) * scale}px`,
                    fontWeight: ann.isBold ? 'bold' : 'normal',
                    fontStyle: ann.isItalic ? 'italic' : 'normal',
                    textDecoration: ann.isUnderline ? 'underline' : 'none',
                    lineHeight: '1.25',
                    caretColor: ann.color || '#000',
                    minWidth: '120px',
                    minHeight: `${Math.max(28, (ann.fontSize || 18) * scale * 1.4)}px`,
                  }}
                />
              )}

              {/* Freehand SVG path */}
              {(ann.type === 'draw' || ann.type === 'highlight') && ann.points && (
                <svg
                  width={widthPx}
                  height={heightPx}
                  viewBox={`0 0 ${widthPx} ${heightPx}`}
                  className="pointer-events-none"
                >
                  <path
                    d={ann.points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x * widthPx} ${p.y * heightPx}`, '')}
                    stroke={ann.color || (ann.type === 'highlight' ? '#facc15' : '#dc2626')}
                    strokeWidth={(ann.strokeWidth || (ann.type === 'highlight' ? 32 : 3)) * scale}
                    strokeOpacity={ann.opacity ?? (ann.type === 'highlight' ? 0.38 : 1)}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* Stamp Body */}
              {ann.type === 'stamp' && (
                ann.imageData ? (
                  <div style={{ width: `${widthPx}px`, height: `${heightPx}px` }}>
                    <img src={ann.imageData} alt="Sello" className="w-full h-full object-contain pointer-events-none" />
                  </div>
                ) : (
                  <StampCanvas
                    label={ann.stampLabel || 'BORRADOR'}
                    color={ann.color || '#b91c1c'}
                    width={widthPx}
                    height={heightPx}
                  />
                )
              )}

              {/* Excel Table Body */}
              {ann.type === 'table' && ann.tableData && (
                <div
                  className="overflow-auto rounded border shadow-lg bg-white"
                  style={{
                    borderColor: ann.tableData.borderColor || '#94a3b8',
                  }}
                  onMouseDown={e => e.stopPropagation()}
                >
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      {ann.tableData.cells.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cellText, cIdx) => (
                            <td
                              key={cIdx}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={e => handleUpdateTableCell(ann, rIdx, cIdx, e.currentTarget.innerText)}
                              className={`p-2 border text-slate-900 outline-none ${
                                rIdx === 0 ? 'font-bold bg-slate-100' : 'bg-white'
                              }`}
                              style={{
                                borderColor: ann.tableData?.borderColor || '#cbd5e1',
                              }}
                            >
                              {cellText}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signature Body */}
              {ann.type === 'signature' && ann.imageData && (
                <div style={{ width: `${widthPx}px`, height: `${heightPx}px` }}>
                  <img
                    src={ann.imageData}
                    alt="Firma"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}

              {/* Image Body */}
              {ann.type === 'image' && ann.imageData && (
                <div style={{ width: `${widthPx}px`, height: `${heightPx}px` }}>
                  <img
                    src={ann.imageData}
                    alt="Imagen"
                    className="w-full h-full object-fill pointer-events-none rounded select-none"
                  />
                </div>
              )}

              {/* Resize Corner Handle */}
              {isSelected && (
                <div
                  onMouseDown={e => handleStartResize(ann, 'se', e)}
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border border-slate-950 rounded-sm cursor-se-resize shadow-md"
                  title="Arrastra para redimensionar"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
