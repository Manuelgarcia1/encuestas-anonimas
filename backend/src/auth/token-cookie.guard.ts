// src/auth/token-cookie.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { EncuestasService } from '../encuestas/services/encuestas.service';

@Injectable()
export class TokenCookieGuard implements CanActivate {
  constructor(private readonly encuestasService: EncuestasService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const token = req.cookies['token_dashboard'];
    if (!token) {
      throw new UnauthorizedException('No autorizado. Falta cookie de sesión.');
    }

    // 1) Validar formato UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      throw new UnauthorizedException('Token de sesión inválido.');
    }

    // 2) Validar existencia del creador en BD
    try {
      await this.encuestasService['findCreador'](token);
    } catch {
      throw new UnauthorizedException('Token no corresponde a ningún creador.');
    }

    // (Opcional) Inyecta el token en la request
    req['creadorToken'] = token;
    return true;
  }
}
