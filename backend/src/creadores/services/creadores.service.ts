// src/creadores/creadores.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creador } from '../entities/creador.entity';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CreadoresService {
  constructor(
    @InjectRepository(Creador) private readonly repo: Repository<Creador>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  // 1. Crear o recuperar el Creador
  async requestAccess(email: string): Promise<void> {
    let creador = await this.repo.findOne({ where: { email } });
    if (!creador) {
      creador = this.repo.create({ email });
      creador = await this.repo.save(creador);
    }

    // 2. Construir el enlace al dashboard
    const baseUrl = this.config.get('APP_URL'); // ej: https://encuestas.midominio.com
    const dashboardUrl = `${baseUrl}/dashboard/${creador.token_dashboard}`;

    // 3. Disparar el envío de correo
    await this.emailService.sendDashboardLink(email, dashboardUrl);
  }

  /** Recuperar creador por token (usado en tu DashboardController) */
  async findByToken(token: string): Promise<Creador> {
    return this.repo.findOneOrFail({ where: { token_dashboard: token } });
  }
}
