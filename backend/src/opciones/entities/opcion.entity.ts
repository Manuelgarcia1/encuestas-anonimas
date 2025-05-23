import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Pregunta } from './../../preguntas/entities/pregunta.entity';
import { RespuestaOpcion } from '../../respuestas-opciones/entities/respuestas-opcione.entity';

@Entity({ name: 'opciones' })
export class Opcion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  texto: string;

  @Column()
  numero: number;

  @ManyToOne(() => Pregunta)
  @JoinColumn({ name: 'id_pregunta' })
  @Exclude()
  pregunta: Pregunta;

  @OneToMany(() => RespuestaOpcion, (respuestaOpcion) => respuestaOpcion.opcion)
  respuestasOpciones: RespuestaOpcion[]; // Nombre consistente
}
