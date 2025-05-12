import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreadoresService } from './creadores.service';
import { CreateCreadorDto } from './dto/create-creador.dto';

@Controller('creadores')
export class CreadoresController {
  constructor(private readonly svc: CreadoresService) {}

  /**
   * POST /creadores
   * Crea un Creador y devuelve su token_dashboard.
   * 201 si se crea, 409 si el email existe.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCreadorDto,
  ): Promise<{ token_dashboard: string }> {
    const creador = await this.svc.register(dto);
    return { token_dashboard: creador.token_dashboard };
  }
}
