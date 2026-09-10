/**
 * DTO para la respuesta de subida de fotografía.
 */
import { ApiProperty } from '@nestjs/swagger';

export class UploadPhotoResponseDto {
  @ApiProperty()
  photoUrl: string;

  @ApiProperty()
  message: string;
}
