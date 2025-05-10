// src/creadores/creador.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Encuesta } from '../entities/encuesta.entity';

@Entity('creadores')
export class Creador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 36, unique: true })
  token_dashboard: string;

  @OneToMany(() => Encuesta, (encuesta) => encuesta.creador)
  encuestas: Encuesta[];
}
