import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronUp, ChevronDown, Check, Send, AlertCircle, Home } from 'lucide-angular';
import { Router } from '@angular/router';

interface Question {
  id: number;
  text: string;
  type: 'simple' | 'multiple' | 'text';
  options: string[]; // Made mandatory since all question types use it
  answer?: string | null;
  answers?: boolean[];
}

@Component({
  selector: 'app-response',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './response.component.html',
  styles: ``
})
export class ResponseComponent {
  // Icons
  icons = { ChevronUp, ChevronDown, Check, Send, AlertCircle, Home };

  // Survey questions with proper typing
  questions: Question[] = [
    {
      id: 1,
      text: '¿En qué fecha se creó la plataforma de encuestas?',
      type: 'simple',
      options: ['Enero 2023', 'Marzo 2023', 'Septiembre 2024', 'Mayo 2025'],
      answer: null
    },
    {
      id: 2,
      text: '¿Qué características te gustan de nuestra plataforma?',
      type: 'multiple',
      options: ['Usabilidad', 'Diseño', 'Rendimiento', 'Soporte'],
      answers: new Array(4).fill(false) // Initialize with false for each option
    },
    {
      id: 3,
      text: '¿Qué sugerencias tienes para mejorar la plataforma?',
      type: 'text',
      options: [], // Empty array for text questions
      answer: ''
    }
  ];

  currentQuestionIndex = 0;
  isSubmitted = false;
  showAlert = false;
  alertMessage = '';

  constructor(private router: Router) {}

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }


  // Navigation methods
  nextQuestion(): void {
    if (!this.validateCurrentQuestion()) {
      return;
    }
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  // Validation
  validateCurrentQuestion(): boolean {
    if (this.currentQuestion.type === 'simple' && !this.currentQuestion.answer) {
      this.showAlertMessage('Por favor selecciona una opción antes de continuar');
      return false;
    }
    if (this.currentQuestion.type === 'multiple' && 
        this.currentQuestion.answers?.every(a => !a)) {
      this.showAlertMessage('Por favor selecciona al menos una opción antes de continuar');
      return false;
    }
    if (this.currentQuestion.type === 'text' && !this.currentQuestion.answer?.trim()) {
      this.showAlertMessage('Por favor ingresa tu respuesta antes de continuar');
      return false;
    }
    return true;
  }

  showAlertMessage(message: string): void {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  // Submission
  submitForm(): void {
    if (!this.validateCurrentQuestion()) {
      return;
    }
    this.isSubmitted = true;
    // Here you would typically send the data to a server
    console.log('Form submitted:', {
      questions: this.questions.map(q => ({
        question: q.text,
        answer: q.type === 'multiple' 
          ? q.options?.filter((_, i) => q.answers?.[i]) 
          : q.answer
      }))
    });
  }

  // Navigation
  createNewSurvey(): void {
    this.router.navigate(['']);
  }
}
