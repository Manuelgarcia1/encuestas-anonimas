// src/respuestas/entities/respuesta-opcion.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Respuesta } from '../../respuestas/entities/respuesta.entity';
import { Opcion } from '../../opciones/entities/opcion.entity';
import { Pregunta } from '../../preguntas/entities/pregunta.entity';

@Entity('respuestas_opciones')
export class RespuestaOpcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Respuesta)
  @JoinColumn({ name: 'respuestaId' })
  respuesta: Respuesta;

  @ManyToOne(() => Opcion)
  @JoinColumn({ name: 'opcionId' })
  opcion: Opcion;

  @ManyToOne(() => Pregunta)
  pregunta: Pregunta;
}
