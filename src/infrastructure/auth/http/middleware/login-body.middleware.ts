import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

type LoginBody = {
  email?: string;
  username?: string;
  user?: string;
  correo?: string;
  name?: string;
  Name?: string;
  password?: string;
  pass?: string;
  Password?: string;
};

@Injectable()
export class LoginBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
      const body = req.body as LoginBody;

      if (!body.email) {
        body.email = body.username ?? body.user ?? body.correo ?? body.name ?? body.Name;
      }

      if (!body.password) {
        body.password = body.pass ?? body.Password;
      }

      delete body.username;
      delete body.user;
      delete body.correo;
      delete body.name;
      delete body.Name;
      delete body.pass;
      delete body.Password;
    }

    next();
  }
}
