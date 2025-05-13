import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Creador } from './entities/creador.entity';
import { CreadoresService } from './services/creadores.service';
import { CreadoresController } from './controller/creadores.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Creador]),
  ],
  providers: [CreadoresService],
  controllers: [CreadoresController],
  exports: [CreadoresService],
})
export class CreadoresModule {}
