// src/documents/dto/create-document.dto.ts
import { IsOptional, IsObject, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../enums/file-type.enum';

export class CreateDocumentDto {
    @ApiProperty({
        description: 'Nom du fichier',
        required: true,
        example: 'mon-document'
    })
    @IsString()
    fileName: string;

    @ApiProperty({
        description: 'Type de fichier',
        enum: FileType,
        required: true,
        example: FileType.DOCUMENT
    })
    @IsEnum(FileType)
    fileType: FileType;

    @ApiProperty({
        description: 'Métadonnées associées au document',
        required: false,
        example: { category: 'invoice', tags: ['urgent', '2023'] }
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

