// src/encuestas/encuesta.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pregunta } from '../../preguntas/entities/pregunta.entity';
import { Creador } from '../../creadores/entities/creador.entity';
import { EstadoEncuestaEnum } from '../enums/estado-encuestas.enum';
import { Respuesta } from '../../respuestas/entities/respuesta.entity';

@Entity('encuestas')
export class Encuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  token_respuesta: string;

  @Column()
  token_resultados: string;

  @Column({ type: 'enum', enum: EstadoEncuestaEnum })
  tipo: EstadoEncuestaEnum;

  @ManyToOne(() => Creador, (creador) => creador.encuestas, {
    onDelete: 'CASCADE',
  })
  creador: Creador;

  @OneToMany(() => Pregunta, (pregunta) => pregunta.encuesta, {
    cascade: true,
    eager: true, // opcional
  })
  preguntas: Pregunta[];

  @OneToMany(() => Respuesta, (respuesta) => respuesta.encuesta)
  respuestas: Respuesta[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
