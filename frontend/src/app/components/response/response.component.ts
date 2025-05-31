import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Check, AlertCircle, Home } from 'lucide-angular';
import { EncuestasService } from '../../services/encuestas.service';
import { EnviarRespuestasPayload } from '../../services/encuestas.service';

interface Option {
  id: number;
  texto: string; // Cambiado de 'text' a 'texto' para coincidir con la API
}

interface Question {
  id: number;
  text: string;
  type: string;
  options?: Option[]; // Usamos la interfaz Option definida arriba
  answer?: any;
}

@Component({
  selector: 'app-response',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './response.component.html',
})
export class ResponseComponent implements OnInit {
  icons = { Check, AlertCircle, Home };

  surveyName: string = '';
  surveyToken: string = '';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  isSubmitted = false;
  showAlert = false;
  alertMessage = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encuestasService: EncuestasService
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.loadSurvey(token);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadSurvey(token: string): void {
    this.surveyToken = token;
    this.encuestasService.getSurveyByToken(token).subscribe({
      next: (response) => {
        this.surveyName = response.data.nombre;
        this.questions = response.data.preguntas.map((p: any) => ({
          id: p.id,
          text: p.texto,
          type: p.tipo,
          options: p.opciones ? p.opciones.map((o: any) => ({
            id: o.id,
            texto: o.texto // Mantenemos el nombre del campo como viene del API
          })) : [],
          answer: p.tipo === 'OPCION_MULTIPLE_SELECCION_MULTIPLE' ? [] : null
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading survey:', err);
        this.router.navigate(['/']);
      }
    });
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  nextQuestion(): void {
    if (!this.validateCurrentQuestion()) return;
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }


  validateCurrentQuestion(): boolean {
    const question = this.currentQuestion;

    if (question.type === 'ABIERTA' && !question.answer?.trim()) {
      this.showAlertMessage('Por favor ingresa tu respuesta');
      return false;
    }

    if ((question.type === 'OPCION_MULTIPLE_SELECCION_SIMPLE' ||
      question.type === 'OPCION_MULTIPLE_SELECCION_MULTIPLE') &&
      !question.answer) {
      this.showAlertMessage('Por favor selecciona una opción');
      return false;
    }

    return true;
  }

  showAlertMessage(message: string): void {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 3000);
  }

  submitForm(): void {
    const respuestas_abiertas = this.questions
      .filter(q => q.type === 'ABIERTA')
      .map(q => ({
        id_pregunta: q.id,
        texto: q.answer
      }));

    const respuestas_opciones = this.questions
      .filter(q => q.type !== 'ABIERTA')
      .map(q => ({
        id_pregunta: q.id,
        id_opciones: Array.isArray(q.answer) ? q.answer : [q.answer]
      }));

    const payload: EnviarRespuestasPayload = {
      respuestas_abiertas,
      respuestas_opciones
    };

    console.log('Payload de respuestas enviado:', payload);

    this.encuestasService.enviarRespuestas(this.surveyToken, payload).subscribe({
      next: () => {
        this.isSubmitted = true;
        this.showAlertMessage('¡Respuestas enviadas correctamente!');
      },
      error: (err) => {
        this.showAlertMessage('Error al enviar respuestas');
        console.error(err);
      }
    });
  }

  toggleOption(optionId: number): void {
    const question = this.currentQuestion;
    if (!question.answer) {
      question.answer = [];
    }

    const index = question.answer.indexOf(optionId);
    if (index === -1) {
      question.answer.push(optionId);
    } else {
      question.answer.splice(index, 1);
    }
  }

  createNewSurvey(): void {
    this.router.navigate(['/']);
  }
}
