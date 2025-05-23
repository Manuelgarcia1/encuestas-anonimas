// src/respuestas-abiertas/entities/respuestas-abierta.entity.ts
import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, JoinColumn } from 'typeorm';
import { Respuesta } from '../../respuestas/entities/respuesta.entity';
import { Pregunta } from '../../preguntas/entities/pregunta.entity';

@Entity('respuestas_abiertas')
export class RespuestaAbierta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  texto: string;

  @ManyToOne(() => Respuesta)
  @JoinColumn({ name: 'respuestaId' })
  respuesta: Respuesta;

  @ManyToOne(() => Pregunta)
  @JoinColumn({ name: 'preguntaId' }) // Asegúrate que coincida con tu BD
  pregunta: Pregunta;
}
