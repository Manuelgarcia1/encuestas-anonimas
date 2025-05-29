// src/opciones/entities/opcion.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pregunta } from './../../preguntas/entities/pregunta.entity';
import { RespuestaOpcion } from '../../respuestas-opciones/entities/respuestas-opcione.entity';

import { Exclude, Expose } from 'class-transformer';

@Entity({ name: 'opciones' })
export class Opcion {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  texto: string;

  // — para que salga en el JSON:
  @Column({ nullable: true })
  @Expose()
  numero?: number;

  @ManyToOne(() => Pregunta)
  @JoinColumn({ name: 'id_pregunta' })
  @Exclude() // sigues excluyendo la relación completa
  pregunta: Pregunta;

  @OneToMany(() => RespuestaOpcion, (respuestaOpcion) => respuestaOpcion.opcion)
  respuestasOpciones: RespuestaOpcion[]; // Nombre consistente
}
