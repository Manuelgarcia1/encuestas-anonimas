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

  /**
   * Busca o crea un creador, envía el magic-link y
   * devuelve { created, token }.
   */
  async requestAccess(
    email: string,
  ): Promise<{ created: boolean; token: string }> {
    let created = false;
    let creador = await this.repo.findOne({ where: { email } });

    if (!creador) {
      created = true;
      creador = this.repo.create({ email });
      creador = await this.repo.save(creador);
    }

    // Preparamos el enlace apuntando al FRONTEND:
    const frontendUrl = this.config.get<string>('APP_URL');
    const dashboardLink = `${frontendUrl}/dashboard?token=${creador.token_dashboard}`;

    // Enviamos siempre el link por e-mail:
    await this.emailService.sendDashboardLink(email, dashboardLink);

    return { created, token: creador.token_dashboard };
  }

  async tokenExists(token: string): Promise<boolean> {
    // .count() devuelve 0 o más; es eficiente y no lanza
    const count = await this.repo.count({ where: { token_dashboard: token } });
    return count > 0;
  }

  async findByToken(token: string): Promise<Creador> {
    return this.repo.findOneOrFail({ where: { token_dashboard: token } });
  }
}
