// src/documents/documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from '@prisma/client';

const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class DocumentsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    if (!await existsAsync(this.uploadDir)) {
      await mkdirAsync(this.uploadDir, { recursive: true });
    }
  }

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto
  ): Promise<Document> {
    const fileExtension = path.extname(file.originalname);
    const newFilename = `${createDocumentDto.fileName}${fileExtension}`;
    const newPath = path.join(this.uploadDir, newFilename);

    // Déplacer le fichier vers le nouveau chemin avec le nom souhaité
    await fs.promises.rename(file.path, newPath);

    return this.prisma.document.create({
      data: {
        filename: newFilename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: newPath,
        fileType: createDocumentDto.fileType,
        metadata: createDocumentDto.metadata || {},
      },
    });
  }

  async findAll(): Promise<Document[]> {
    return this.prisma.document.findMany();
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
    
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    // Vérifier si le document existe
    await this.findOne(id);
    
    // Créer l'objet de mise à jour avec les propriétés fournies
    const updateData: any = {};
    
    if (updateDocumentDto.filename) {
      updateData.filename = updateDocumentDto.filename;
    }
    
    if (updateDocumentDto.metadata) {
      // Pour les données JSON, nous devons fusionner avec les données existantes
      const document = await this.findOne(id);
      updateData.metadata = {
        ...document.metadata as object,
        ...updateDocumentDto.metadata,
      };
    }
    
    return this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    
    // Supprimer le fichier physiquement
    if (await existsAsync(document.path)) {
      await unlinkAsync(document.path);
    }
    
    await this.prisma.document.delete({
      where: { id },
    });
  }

  async getFilePath(id: string): Promise<string> {
    const document = await this.findOne(id);
    return document.path;
  }
}