export type ToolId =
  | 'dashboard'
  | 'organize'
  | 'editor'
  | 'merge'
  | 'split'
  | 'compress'
  | 'watermark'
  | 'page-numbers'
  | 'pdf-to-img'
  | 'img-to-pdf';

export interface ToolDef {
  id: ToolId;
  title: string;
  description: string;
  category: 'organize' | 'edit' | 'optimize' | 'convert' | 'security';
  badge?: string;
  icon: string;
  color: string;
}

export interface PDFPageInfo {
  pageIndex: number;
  displayNumber: number;
  rotation: number;
  thumbnailUrl?: string;
  width: number;
  height: number;
}
