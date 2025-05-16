import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronDown, ListChecks, TextCursorInput, CheckSquare, Calendar } from 'lucide-angular';
import { HeaderFormComponent } from '../../header/header-form/header-form.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HeaderFormComponent],
  templateUrl: './results.component.html',
  styles: ``
})
export class ResultsComponent {
  // Icons
  icons = {
    ListChecks,
    TextCursorInput,
    CheckSquare,
    ChevronDown,
    Calendar
  };

  // Sample data with expanded questions and responses
  questions = [
    { id: 1, text: '¿Qué características te gustan de nuestra plataforma?', type: 'multiple', 
      options: ['Usabilidad', 'Diseño', 'Rendimiento', 'Soporte', 'Precio'] },
    { id: 2, text: '¿Cómo calificarías nuestro servicio?', type: 'simple', 
      options: ['Excelente', 'Bueno', 'Regular', 'Malo'] },
    { id: 3, text: '¿Qué tan frecuentemente usas nuestra plataforma?', type: 'simple',
      options: ['Diariamente', 'Semanalmente', 'Mensualmente', 'Ocasionalmente'] },
    { id: 4, text: '¿Qué áreas crees que deberíamos mejorar?', type: 'multiple',
      options: ['Interfaz de usuario', 'Velocidad', 'Documentación', 'Soporte al cliente', 'Funcionalidades'] },
    { id: 5, text: '¿Recomendarías nuestro servicio a otros?', type: 'simple',
      options: ['Definitivamente sí', 'Probablemente sí', 'No estoy seguro', 'Probablemente no'] },
    { id: 6, text: 'Describe tu experiencia general con la plataforma', type: 'text' },
    { id: 7, text: '¿Qué funcionalidades adicionales te gustaría ver?', type: 'text' }
  ];

  responses = [
    {
      date: '28 de junio 13:07',
      answers: [
        ['Usabilidad', 'Diseño', 'Precio'], // Multiple selection
        'Excelente', // Single selection
        'Diariamente', // Single selection
        ['Interfaz de usuario', 'Funcionalidades'], // Multiple selection
        'Definitivamente sí', // Single selection
        'La plataforma ha superado mis expectativas en todos los aspectos', // Text answer
        'Me gustaría ver más opciones de personalización' // Text answer
      ]
    },
    {
      date: '27 de junio 09:15',
      answers: [
        ['Rendimiento', 'Soporte'],
        'Bueno',
        'Semanalmente',
        ['Velocidad', 'Documentación'],
        'Probablemente sí',
        'Buena experiencia en general, aunque a veces es lenta',
        'Integración con otras herramientas que uso'
      ]
    },
    {
      date: '26 de junio 16:42',
      answers: [
        ['Diseño'],
        'Regular',
        'Mensualmente',
        ['Soporte al cliente'],
        'No estoy seguro',
        'La plataforma cumple con lo básico pero tiene áreas de oportunidad',
        'Mejorar el sistema de notificaciones'
      ]
    },
    {
      date: '25 de junio 11:30',
      answers: [
        ['Usabilidad', 'Rendimiento', 'Soporte'],
        'Excelente',
        'Diariamente',
        ['Documentación'],
        'Definitivamente sí',
        'La mejor plataforma que he usado en su categoría',
        'Más opciones de exportación de datos'
      ]
    },
    {
      date: '24 de junio 14:22',
      answers: [
        ['Precio'],
        'Malo',
        'Ocasionalmente',
        ['Interfaz de usuario', 'Velocidad', 'Soporte al cliente'],
        'Probablemente no',
        'No cumple con lo que necesito y es complicada de usar',
        'Rediseño completo de la interfaz'
      ]
    }
  ];

  // Filter options
  filterOptions = [
    { value: 'asc', label: 'Fecha ascendente' },
    { value: 'desc', label: 'Fecha descendente' }
  ];
  selectedFilter = 'desc';

  // Function to get icon based on question type
  getQuestionIcon(type: string) {
    switch (type) {
      case 'simple': return this.icons.ListChecks;
      case 'text': return this.icons.TextCursorInput;
      case 'multiple': return this.icons.CheckSquare;
      default: return this.icons.ListChecks;
    }
  }

  // Function to format multiple selection answers
  formatAnswer(answer: any, questionType: string): string {
    if (questionType === 'multiple' && Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer || '-';
  }
}
