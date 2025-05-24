import { Component, HostListener, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';

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
export class CreateComponent implements OnDestroy {
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
    Check,
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

  // Nuevas propiedades para control de cambios
  hasUnsavedChanges = false;
  isSaving = false;
  lastSavedState = '';
  private destroy$ = new Subject<void>();

  constructor(
    private draftService: DraftQuestionsService,
    private route: ActivatedRoute,
    private encuestasService: EncuestasService,
    private router: Router
  ) {
    this.draftService.questions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(qs => {
        this.questions = qs;
        this.checkForChanges();
      });
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
      this.cargarEncuestaExistente(parseInt(encuestaId), token_dashboard);
    }

    this.lastSavedState = this.getCurrentStateSnapshot();
  }

  private showToast(message: string, isError: boolean = false) {
    const toast = document.createElement('div');
    toast.className = `
    fixed bottom-4 right-4 z-50
    flex items-center justify-between
    px-4 py-3 rounded-lg shadow-lg
    text-white font-medium
    animate-fade-in
    ${isError ? 'bg-red-500' : 'bg-green-500'}
  `;

    toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-4">
      <i-lucide name="X" class="w-5 h-5"></i-lucide>
    </button>
  `;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  private cargarEncuestaExistente(encuestaId: number, token: string) {
    this.encuestasService.getEncuestaPorId(token, encuestaId).subscribe({
      next: (response) => {
        if (response && response.data) {
          const encuesta = response.data;
          this.nombreEncuesta = encuesta.nombre;

          // Mapear preguntas del backend al formato del frontend
          this.questions = (encuesta.preguntas || []).map((pregunta: any, index: number) => ({
            id: index + 1,
            text: pregunta.texto,
            type: this.mapTipoBackToFront(pregunta.tipo),
            active: false,
            required: false, // Puedes ajustar esto según tu modelo
            options: pregunta.opciones ? pregunta.opciones.map((op: any) => op.texto) : []
          }));

          // Activar la primera pregunta si hay preguntas
          if (this.questions.length > 0) {
            this.setActiveQuestion(this.questions[0].id);
          }

          // Actualizar el estado guardado
          this.lastSavedState = this.getCurrentStateSnapshot();
          this.hasUnsavedChanges = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar la encuesta:', err);
        this.showToast('No se pudo cargar la encuesta. Intente nuevamente.', true);
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para obtener snapshot del estado actual
  private getCurrentStateSnapshot(): string {
    return JSON.stringify({
      nombre: this.nombreEncuesta,
      questions: this.questions
    });
  }

  // Método para verificar cambios
  private checkForChanges(): void {
    const currentState = JSON.stringify({
      nombre: this.nombreEncuesta,
      questions: this.questions.map(q => ({
        text: q.text,
        type: q.type,
        required: q.required,
        options: q.options || []
      }))
    });

    this.hasUnsavedChanges = currentState !== this.lastSavedState;
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
      this.checkForChanges();
    }
  }

  onOptionChange(index: number) {
    if (this.activeQuestion) {
      this.activeQuestion.options = [...this.currentOptions];
      this.draftService.updateQuestions(this.questions);
      this.checkForChanges();
    }
  }

  onQuestionTextChange() {
    this.draftService.updateQuestions(this.questions);
    this.checkForChanges();
  }

  onNombreEncuestaChange() {
    this.checkForChanges();
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

  // Método para guardar encuesta con validaciones
  guardarEncuesta() {
    // Validaciones básicas
    if (!this.nombreEncuesta || this.nombreEncuesta.trim().length < 3) {
      this.showToast('Nombre de encuesta inválido (mínimo 3 caracteres)', true);
      return;
    }

    if (this.questions.length === 0) {
      this.showToast('Debe agregar al menos una pregunta', true);
      return;
    }

    // Validar cada pregunta
    for (const question of this.questions) {
      if (!question.text || question.text.trim().length < 5) {
        this.showToast(`Pregunta ${question.id}: mínimo 5 caracteres`, true);
        return;
      }

      if ((question.type === 'radio' || question.type === 'checkbox') &&
        (!question.options || question.options.length < 2)) {
        this.showToast(`Pregunta ${question.id}: necesita 2 opciones`, true);
        return;
      }
    }

    this.isSaving = true;

    const preguntasBackend = this.questions.map((q, idx) => ({
      numero: idx + 1,
      texto: q.text,
      tipo: this.mapTipoFrontToBack(q.type),
      opciones: q.options?.map((opt, idx) => ({
        texto: opt,
        numero: idx + 1
      })) || []
    }));

    const encuesta = {
      nombre: this.nombreEncuesta.trim(),
      preguntas: preguntasBackend,
    };

    const token_dashboard = this.getTokenFromCookie('td');
    this.encuestasService.crearEncuesta(encuesta, token_dashboard).subscribe({
      next: (resp) => {
        this.isSaving = false;
        this.lastSavedState = this.getCurrentStateSnapshot();
        this.hasUnsavedChanges = false;
        this.clearDraft();
        this.showToast('¡Encuesta guardada como borrador!');

        if (token_dashboard) {
          this.router.navigate(['/dashboard'], {
            queryParams: { token: token_dashboard },
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(
          err.error?.message || 'Error al guardar. Intente nuevamente',
          true
        );
      }
    });
  }
}
