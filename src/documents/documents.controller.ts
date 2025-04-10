// src/documents/documents.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    Res,
    HttpStatus,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Express, Response } from 'express';
  import { createReadStream } from 'fs';
  import * as multer from 'multer';
  import * as path from 'path';
  import { DocumentsService } from './documents.service';
  import { CreateDocumentDto } from './dto/create-document.dto';
  import { UpdateDocumentDto } from './dto/update-document.dto';
  import { v4 as uuidv4 } from 'uuid';
  import { Document } from '@prisma/client';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiParam,
    ApiProduces,
    ApiProperty,
  } from '@nestjs/swagger';
  import { FileType } from './enums/file-type.enum';
  
  // Définir un type pour Swagger (car Prisma ne génère pas de décorateurs ApiProperty)
  class DocumentEntity implements Document {
    @ApiProperty({
      description: 'Identifiant unique du document',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;
  
    @ApiProperty({
      description: 'Nom du fichier stocké dans le système',
      example: '550e8400-e29b-41d4-a716-446655440000.pdf'
    })
    filename: string;
  
    @ApiProperty({
      description: 'Type de fichier',
      example: 'pdf'
    })
    fileType: string;
  
    @ApiProperty({
      description: 'Nom original du fichier',
      example: 'facture-2023-01.pdf'
    })
    originalName: string;
  
    @ApiProperty({
      description: 'Type MIME du fichier',
      example: 'application/pdf'
    })
    mimeType: string;
  
    @ApiProperty({
      description: 'Taille du fichier en octets',
      example: 15240
    })
    size: number;
  
    @ApiProperty({
      description: 'ID public du fichier',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    publicId: string | null;
    
    @ApiProperty({
      description: 'Chemin d\'accès au fichier physique',
      example: 'uploads/550e8400-e29b-41d4-a716-446655440000.pdf'
    })
    path: string;
  
    @ApiProperty({
      description: 'Métadonnées personnalisées associées au document',
      example: { category: 'invoice', year: 2023, client: 'Acme Inc.' }
    })
    metadata: any;
  
    @ApiProperty({
      description: 'Date de création du document',
      example: '2023-07-14T10:30:00Z'
    })
    createdAt: Date;
  
    @ApiProperty({
      description: 'Date de dernière modification du document',
      example: '2023-07-14T11:45:00Z'
    })
    updatedAt: Date;
  }
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
  
  @ApiTags('documents')
  @Controller('documents')
  export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}
  
    @Post()
    @ApiOperation({ summary: 'Créer un nouveau document' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        required: ['fileName', 'fileType', 'file'],
        properties: {
          fileName: {
            type: 'string',
            description: 'Nom du fichier'
          },
          fileType: {
            type: 'string',
            enum: Object.values(FileType),
            description: 'Type de fichier'
          },
          file: {
            type: 'string',
            format: 'binary',
            description: 'Fichier à uploader'
          }
        }
      }
    })
    @UseInterceptors(FileInterceptor('file'))
    async create(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 10000000 }), // 10MB
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
          ],
        }),
      )
      file: Express.Multer.File,
      @Body() createDocumentDto: CreateDocumentDto,
    ) {
      return this.documentsService.create(file, createDocumentDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Récupérer tous les documents' })
    @ApiResponse({
      status: 200,
      description: 'Liste de tous les documents',
      type: [DocumentEntity],
    })
    async findAll() {
      return this.documentsService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Récupérer un document par son ID' })
    @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
    @ApiResponse({
      status: 200,
      description: 'Le document a été trouvé',
      type: DocumentEntity,
    })
    @ApiResponse({
      status: 404,
      description: 'Document non trouvé',
    })
    async findOne(@Param('id') id: string) {
      return this.documentsService.findOne(id);
    }
  
    @Get(':id/download')
    @ApiOperation({ summary: 'Télécharger le contenu d\'un document' })
    @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
    @ApiResponse({
      status: 200,
      description: 'Fichier à télécharger',
    })
    @ApiResponse({
      status: 404,
      description: 'Document non trouvé',
    })
    @ApiProduces('application/octet-stream')
    async download(@Param('id') id: string, @Res() res: Response) {
      const document = await this.documentsService.findOne(id);
      const file = createReadStream(document.path);
      
      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.originalName}"`,
      });
      
      file.pipe(res);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour les métadonnées d\'un document' })
    @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
    @ApiBody({ type: UpdateDocumentDto })
    @ApiResponse({
      status: 200,
      description: 'Le document a été mis à jour',
      type: DocumentEntity,
    })
    @ApiResponse({
      status: 404,
      description: 'Document non trouvé',
    })
    async update(
      @Param('id') id: string,
      @Body() updateDocumentDto: UpdateDocumentDto,
    ) {
      return this.documentsService.update(id, updateDocumentDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un document' })
    @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
    @ApiResponse({
      status: 200,
      description: 'Le document a été supprimé',
    })
    @ApiResponse({
      status: 404,
      description: 'Document non trouvé',
    })
    async remove(@Param('id') id: string) {
      await this.documentsService.remove(id);
      return { statusCode: HttpStatus.OK, message: 'Document successfully deleted' };
    }
  }