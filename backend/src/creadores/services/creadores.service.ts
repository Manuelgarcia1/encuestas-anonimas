// src/creadores/creadores.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creador } from '../entities/creador.entity';
import { CreateCreadorDto } from '../dto/create-creador.dto';

@Injectable()
export class CreadoresService {
  constructor(
    @InjectRepository(Creador)
    private readonly repo: Repository<Creador>,
  ) {}

  /**
   * Registra un nuevo creador:
   * - Verifica email único
   * - token_dashboard se genera automáticamente (UUID)
   * - Guarda en BD
   */
  async register(dto: CreateCreadorDto): Promise<Creador> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    // La entidad asignará token_dashboard automáticamente
    const creador = this.repo.create({ email: dto.email });
    return this.repo.save(creador);
  }

  /** Opcional: recuperar creador por token */
  async findByToken(token: string): Promise<Creador> {
    return this.repo.findOneOrFail({ where: { token_dashboard: token } });
  }
}
