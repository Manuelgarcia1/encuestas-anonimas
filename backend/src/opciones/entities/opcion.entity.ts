// src/opciones/entities/opcion.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Pregunta } from '../../preguntas/entities/pregunta.entity';

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
}
