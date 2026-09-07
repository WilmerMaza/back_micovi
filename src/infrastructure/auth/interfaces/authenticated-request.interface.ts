/**
 * Interfaz para requests autenticados en la aplicación.
 * Extiende el Request de Express con el usuario autenticado.
 */
import type { Request } from 'express';
import { AuthenticatedUserDto } from 'src/application/auth/dto/authenticated-user.dto';

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUserDto;
};
