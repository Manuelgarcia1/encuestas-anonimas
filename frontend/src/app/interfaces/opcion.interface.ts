export interface Option {
  id?: number; 
  _tempId?: number; // Agregado para consistencia si se añaden opciones a preguntas existentes
  texto: string;
  numero: number;
}
