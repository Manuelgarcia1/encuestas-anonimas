import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';
import { Encuesta } from '../../encuestas/entities/encuesta.entity';

@Entity('creadores')
export class Creador {
  // 1) ID clásico: entero auto-incremental (1,2,3,…)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  // 2) Token: UUID generado automáticamente
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  token_dashboard: string;

  @OneToMany(() => Encuesta, (encuesta) => encuesta.creador, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  
  encuestas: Encuesta[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
