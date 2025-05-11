// src/encuestas/encuesta.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Pregunta } from '../entities/preguntas.entity';
import { Creador } from '../entities/creadores.entity';

@Entity('encuestas')
export class Encuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  codigo_respuesta: string;

  @Column()
  codigo_resultados: string;

  @ManyToOne(() => Creador, (creador) => creador.encuestas, { onDelete: 'CASCADE' })
  creador: Creador;

  @OneToMany(() => Pregunta, (pregunta) => pregunta.encuesta)
  preguntas: Pregunta[];
}
