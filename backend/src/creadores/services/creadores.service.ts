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
   * devuelve `true` si se creó uno nuevo, `false` si ya existía.
   */
  async requestAccess(email: string): Promise<boolean> {
    let created = false;
    let creador = await this.repo.findOne({ where: { email } });

    if (!creador) {
      created = true;
      creador = this.repo.create({ email });
      creador = await this.repo.save(creador);
    }

    const baseUrl     = this.config.get<string>('APP_URL');
    const dashboardUrl = `${baseUrl}/dashboard/${creador.token_dashboard}`;
    await this.emailService.sendDashboardLink(email, dashboardUrl);

    return created;
  }

  async findByToken(token: string): Promise<Creador> {
    return this.repo.findOneOrFail({ where: { token_dashboard: token } });
  }
}
