// src/documents/dto/update-document.dto.ts
import { IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Nouveau nom de fichier',
    required: false,
    example: 'facture-renommee.pdf'
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({
    description: 'Métadonnées à mettre à jour',
    required: false,
    // type: 'object',
    example: { status: 'approved', processedAt: '2023-07-14' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}