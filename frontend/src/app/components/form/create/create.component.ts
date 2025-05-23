import { Component, HostListener } from '@angular/core';
import {
  LucideAngularModule,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Calendar,
  TextCursorInput,
  Mail,
  Phone,
  Image,
  Video,
  CheckSquare,
  Circle,
  X,
  MoreVertical,
  Copy,
  Trash2,
  Check,
} from 'lucide-angular';
import { HeaderFormComponent } from '../../header/header-form/header-form.component';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';
import { ActivatedRoute } from '@angular/router';
import { DraftQuestionsService } from '../../../services/borrador.service';
import { FormsModule } from '@angular/forms';
import { EncuestasService } from '../../../services/encuestas.service';
import { Router } from '@angular/router';

// Definimos una interfaz para el tipo de pregunta
interface Question {
  id: number;
  text: string;
  type: string;
  active: boolean;
  required: boolean; // Nuevo campo
  showMenu?: boolean;
  options?: string[];
}

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    HeaderFormComponent,
    LucideAngularModule,
    ModalCreateComponent,
    CommonModule,
    TruncatePipe,
    FormsModule,
  ],
  templateUrl: './create.component.html',
})
export class CreateComponent {
  // Iconos disponibles
  // En tus imports de Lucide
  icons = {
    Plus,
    Eye,
    ChevronDown,
    ChevronUp,
    ListChecks,
    Calendar,
    TextCursorInput,
    Mail,
    Phone,
    Image,
    Video,
    CheckSquare,
    Circle,
    X,
    MoreVertical,
    Copy,
    Trash2,
    Check, // Agrega Check
  };

  // Estado del sidebar móvil
  mobileSidebarOpen = false;

  // Mapeo de tipos de pregunta a iconos
  questionTypeIcons: { [key: string]: any } = {
    multiple_choice: this.icons.ListChecks,
    text: this.icons.TextCursorInput,
    date: this.icons.Calendar,
    email: this.icons.Mail,
    phone: this.icons.Phone,
    image: this.icons.Image,
    video: this.icons.Video,
    checkbox: this.icons.CheckSquare,
    radio: this.icons.Circle,
  };

  // Estado del modal
  showModal = false;
  questions: Question[] = [];
  currentOptions: string[] = [];
  nombreEncuesta: string = '';

  // Getter para obtener la pregunta activa
  get activeQuestion() {
    return this.questions.find((q) => q.active);
  }

  constructor(
    private draftService: DraftQuestionsService,
    private route: ActivatedRoute,
    private encuestasService: EncuestasService,
    private router: Router
  ) {
    this.draftService.questions$.subscribe((qs) => (this.questions = qs));
  }

  mapTipoBackToFront(tipo: string): string {
    switch (tipo) {
      case 'ABIERTA':
        return 'text';
      case 'OPCION_MULTIPLE_SELECCION_SIMPLE':
        return 'radio';
      case 'OPCION_MULTIPLE_SELECCION_MULTIPLE':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  ngOnInit() {
    const encuestaId = this.route.snapshot.paramMap.get('id');
    const token_dashboard = this.getTokenFromCookie('td');
    if (encuestaId && token_dashboard) {
      /*
      this.encuestasService.getEncuestaPorId(token_dashboard, encuestaId).subscribe({
        next: (encuesta) => {
          this.nombreEncuesta = encuesta.nombre;
          this.questions = (encuesta.preguntas || []).map((p: any, idx: number) => ({
            id: idx + 1,
            text: p.texto,
            type: this.mapTipoBackToFront(p.tipo),
            active: false,
            required: false,
            options: p.opciones ? p.opciones.map((o: any) => o.texto) : []
          }));
          if (this.questions.length > 0) {
            this.setActiveQuestion(this.questions[0].id);
          }
        },
        error: (err) => {
          alert('No se pudo cargar la encuesta');
        }
      });
      */
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.questions.length > 0) {
      $event.returnValue = true;
    }
  }

  // Activa una pregunta específica
  setActiveQuestion(questionId: number) {
    this.questions.forEach((q) => {
      q.active = q.id === questionId;
      q.showMenu = false;
      if (
        q.active &&
        (q.type === 'multiple_choice' ||
          q.type === 'checkbox' ||
          q.type === 'radio')
      ) {
        this.currentOptions = q.options
          ? [...q.options]
          : ['Opción 1', 'Opción 2'];
      }
    });
  }

  // Método para añadir una nueva opción
  addOption() {
    if (
      this.activeQuestion &&
      (this.activeQuestion.type === 'multiple_choice' ||
        this.activeQuestion.type === 'checkbox' ||
        this.activeQuestion.type === 'radio')
    ) {
      const newOptionNumber = this.currentOptions.length + 1;
      this.currentOptions.push(`Opción ${newOptionNumber}`);

      // Actualizar las opciones en la pregunta activa
      if (this.activeQuestion) {
        this.activeQuestion.options = [...this.currentOptions];
      }
    }
  }

  // Método para eliminar una opción
  removeOption(index: number) {
    if (
      this.activeQuestion &&
      (this.activeQuestion.type === 'multiple_choice' ||
        this.activeQuestion.type === 'checkbox' ||
        this.activeQuestion.type === 'radio')
    ) {
      this.currentOptions.splice(index, 1);

      // Actualizar las opciones en la pregunta activa
      if (this.activeQuestion) {
        this.activeQuestion.options = [...this.currentOptions];
      }
    }
  }

  // Abre el modal para añadir nueva pregunta
  openAddQuestionModal() {
    this.showModal = true;
  }

  // Cierra el modal
  closeModal() {
    this.showModal = false;
  }

  // Alternar el sidebar móvil
  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  // Método para duplicar pregunta
  duplicateQuestion(questionId: number) {
    const questionToDuplicate = this.questions.find((q) => q.id === questionId);
    if (questionToDuplicate) {
      const newId = Math.max(...this.questions.map((q) => q.id)) + 1;
      const duplicated = {
        ...questionToDuplicate,
        id: newId,
        active: false,
        showMenu: false,
      };
      const updated = [...this.questions, duplicated];
      this.draftService.updateQuestions(updated);
    }
  }

  // Método para borrar pregunta
  deleteQuestion(questionId: number) {
    const updated = this.questions.filter((q) => q.id !== questionId);
    this.draftService.updateQuestions(updated);
    if (updated.length > 0 && !this.activeQuestion) {
      this.setActiveQuestion(updated[0].id);
    }
  }

  // Añade una nueva pregunta del tipo seleccionado
  addQuestion(type: string) {
    const newId =
      this.questions.length > 0
        ? Math.max(...this.questions.map((q) => q.id)) + 1
        : 1;
    const defaultTexts = {
      multiple_choice: 'Nueva pregunta de opción múltiple',
      text: 'Nueva pregunta de texto abierto',
      date: 'Nueva pregunta de fecha',
      email: 'Nueva pregunta de email',
      phone: 'Nueva pregunta de teléfono',
      image: 'Nueva pregunta con imagen',
      video: 'Nueva pregunta con video',
      checkbox: 'Nueva pregunta con casillas',
      radio: 'Nueva pregunta con botones de radio',
    };

    const newQuestion: Question = {
      id: newId,
      text: defaultTexts[type as keyof typeof defaultTexts] || 'Nueva pregunta',
      type: type,
      active: false,
      showMenu: false,
      required: false, // Inicializar como no requerida
    };

    // Inicializar opciones para preguntas que las necesiten
    if (type === 'multiple_choice' || type === 'checkbox' || type === 'radio') {
      newQuestion.options = ['Opción 1', 'Opción 2'];
      this.currentOptions = [...newQuestion.options];
    }

    this.draftService.addQuestion(newQuestion);
    this.setActiveQuestion(newId);
    this.closeModal();
    this.mobileSidebarOpen = false;
  }

  // Cierra todos los menús abiertos
  closeAllMenus() {
    this.questions.forEach((q) => (q.showMenu = false));
  }

  // Método para alternar el estado de obligatoriedad
  toggleQuestionRequired() {
    if (this.activeQuestion) {
      this.activeQuestion.required = !this.activeQuestion.required;
      this.draftService.updateQuestions(this.questions);
    }
  }

  onOptionChange(index: number) {
    if (this.activeQuestion) {
      this.activeQuestion.options = [...this.currentOptions];
      this.draftService.updateQuestions(this.questions);
    }
  }

  onQuestionTextChange() {
    this.draftService.updateQuestions(this.questions);
  }

  clearDraft() {
    this.draftService.clearDraft();
  }

  mapTipoFrontToBack(type: string): string {
    switch (type) {
      case 'text':
        return 'ABIERTA';
      case 'radio':
        return 'OPCION_MULTIPLE_SELECCION_SIMPLE';
      case 'checkbox':
        return 'OPCION_MULTIPLE_SELECCION_MULTIPLE';
      // agregá los demás según tu enum TiposRespuestaEnum
      default:
        return 'ABIERTA';
    }
  }

  getTokenFromCookie(nombre: string): string {
    const match = document.cookie.match(
      new RegExp('(^| )' + nombre + '=([^;]+)')
    );
    return match ? match[2] : '';
  }

  guardarEncuesta() {
    const preguntasBackend = this.questions.map((q, idx) => ({
      numero: idx + 1,
      texto: q.text,
      tipo: this.mapTipoFrontToBack(q.type),
      opciones:
        q.options && q.options.length > 0
          ? q.options.map((opt, idx) => ({
              texto: opt,
              numero: idx + 1,
            }))
          : undefined,
    }));

    const encuesta = {
      nombre: this.nombreEncuesta || 'Encuesta sin nombre',
      preguntas: preguntasBackend,
    };

    const token = this.getTokenFromCookie('td');
    this.encuestasService.crearEncuesta(encuesta, token).subscribe({
      next: (resp) => {
        this.clearDraft();
        alert('¡Encuesta guardada como borrador!');
        if (token) {
          this.router.navigate(['/dashboard'], { queryParams: { token } });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        alert('Error al guardar la encuesta');
      },
    });
  }
}
