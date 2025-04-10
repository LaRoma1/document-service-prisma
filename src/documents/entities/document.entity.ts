import { Document } from '@prisma/client';

export class DocumentEntity implements Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  publicId: string | null;
  fileType: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
} 