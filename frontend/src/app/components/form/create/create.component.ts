import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'; // OnInit añadido
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
  Home, 
  BarChart3, 
  Lock, 
} from 'lucide-angular';
import { HeaderFormComponent } from '../../header/header-form/header-form.component';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftQuestionsService } from '../../../services/borrador.service';
import { FormsModule } from '@angular/forms';
import { EncuestasService } from '../../../services/encuestas.service';
import { Subject, takeUntil } from 'rxjs';

interface Question {
  id?: number; 
  _tempId?: number;
  text: string;
  type: string;
  active: boolean;
  showMenu?: boolean;
  options?: Option[];
  numero?: number; // Mantener para la lógica interna y creación, pero no para actualización
}

interface Option {
  id?: number; 
  _tempId?: number; // Agregado para consistencia si se añaden opciones a preguntas existentes
  texto: string;
  numero: number;
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
export class CreateComponent implements OnInit, OnDestroy {
  icons = {
    Plus, Eye, ChevronDown, ChevronUp, ListChecks, Calendar, TextCursorInput,
    Mail, Phone, Image, Video, CheckSquare, Circle, X, MoreVertical, Copy, Trash2,
    Home, BarChart3, Lock,
  };

  mobileSidebarOpen = false;
  public isInputFocused = false;
  questionTypeIcons: { [key: string]: any } = {
    multiple_choice: this.icons.ListChecks,
    radio: this.icons.Circle, 
    checkbox: this.icons.CheckSquare,
    text: this.icons.TextCursorInput,
    date: this.icons.Calendar,
    email: this.icons.Mail,
    phone: this.icons.Phone,
    image: this.icons.Image,
    video: this.icons.Video,
  };

  showModal = false;
  questions: Question[] = [];
  currentOptions: Option[] = [];
  nombreEncuesta: string = '';

  get activeQuestion() {
    return this.questions.find((q) => q.active);
  }

  hasUnsavedChanges = false;
  isSaving = false;
  lastSavedState = '';
  private destroy$ = new Subject<void>();

  // Propiedades para la validación de encuesta publicada
  isSurveyPublished = false;
  showReadOnlyModal = false;
  currentEncuestaId: number | null = null;
  tokenDashboard: string | null = null;
  isEditMode = false;
  preguntasAEliminar: number[] = [];


  constructor(
    private draftService: DraftQuestionsService,
    private route: ActivatedRoute,
    private encuestasService: EncuestasService,
    private router: Router
  ) {}
  
  ngOnInit() {
    const encuestaIdStr = this.route.snapshot.paramMap.get('id');
    this.tokenDashboard = this.getTokenFromCookie('td');

    this.draftService.questions$ // Suscribirse siempre para mantener `this.questions` actualizado
      .pipe(takeUntil(this.destroy$))
      .subscribe(qs => {
        if (!this.isSurveyPublished || !this.isEditMode) { // Solo actualizar si es editable
            this.questions = qs.map((q, index) => ({...q, numero: q.numero ?? index + 1}));
            const activeQ = this.questions.find(q => q.active);
            if (activeQ && (activeQ.type === 'radio' || activeQ.type === 'checkbox' || activeQ.type === 'multiple_choice')) {
                this.currentOptions = activeQ.options ? [...activeQ.options] : [];
            }
            this.checkForChanges();
        }
      });

    if (encuestaIdStr && this.tokenDashboard) {
      this.isEditMode = true;
      this.currentEncuestaId = parseInt(encuestaIdStr, 10);
      if (!isNaN(this.currentEncuestaId)) {
        this.cargarEncuestaExistente(this.currentEncuestaId, this.tokenDashboard);
      } else {
        console.error("ID de encuesta inválido en la ruta:", encuestaIdStr);
        this.isSurveyPublished = false;
        this.initializeNewSurveyWithDefaults();
      }
    } else {
      this.isEditMode = false;
      this.isSurveyPublished = false;
      this.initializeNewSurveyWithDefaults();
    }
  }
  
  // Prepara una encuesta nueva con estructura por defecto
  private initializeNewSurveyWithDefaults() {
    this.nombreEncuesta = 'Nueva Encuesta';
    const defaultQuestion: Question = {
      _tempId: Date.now() + Math.random(),
      text: 'Pregunta de opción múltiple (ejemplo)',
      type: 'radio',
      active: true,
      numero: 1,
      options: [
        { _tempId: Date.now() + 1, texto: 'Opción 1', numero: 1 },
        { _tempId: Date.now() + 2, texto: 'Opción 2', numero: 2 }
      ]
    };
    // Limpiar preguntas existentes del draftService antes de poner las nuevas por defecto
    this.draftService.updateQuestions([defaultQuestion]); 
    this.lastSavedState = this.getCurrentStateSnapshot(); // Tomar snapshot después de inicializar
    this.hasUnsavedChanges = false; // Una encuesta nueva no tiene cambios "sin guardar" inicialmente
  }

  private showToast(message: string, isError: boolean = false) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-[100] flex items-center justify-between px-4 py-3 rounded-lg shadow-xl text-white font-medium ${isError ? 'bg-red-600' : 'bg-green-600'} animate-fade-in-up`;
    toast.innerHTML = `<div class="flex items-center gap-2"><span>${message}</span></div><button onclick="this.parentElement.remove()" class="ml-4 text-white opacity-70 hover:opacity-100">×</button>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'animate-fade-out-down 0.5s forwards';
      setTimeout(() => toast.remove(), 500);
    }, 4500);
  }

  private cargarEncuestaExistente(encuestaId: number, token: string) {
    this.encuestasService.getEncuestaPorId(token, encuestaId).subscribe({
      next: (response) => {
        if (response && response.data) {
          const encuestaApi = response.data;
          this.nombreEncuesta = encuestaApi.nombre;

          if (encuestaApi.tipo && encuestaApi.tipo.toUpperCase() === 'PUBLICADA') {
            this.isSurveyPublished = true;
            this.showReadOnlyModal = true;
          } else {
            this.isSurveyPublished = false;
          }

          const preguntasMapeadas: Question[] = (encuestaApi.preguntas || []).map((pregunta: any, index: number) => ({
            id: pregunta.id,
            _tempId: undefined, 
            text: pregunta.texto,
            type: this.mapTipoBackToFront(pregunta.tipo),
            active: false,
            numero: pregunta.numero ?? index + 1, 
            options: (pregunta.opciones || []).map((op: any, opIdx: number) => ({
              id: op.id,
              _tempId: undefined,
              texto: op.texto,
              numero: op.numero ?? opIdx + 1 
            }))
          }));
          
          if (this.isSurveyPublished) {
              this.questions = preguntasMapeadas; // Solo mostrar, no actualizar draft
          } else {
              this.draftService.updateQuestions(preguntasMapeadas); 
          }
          
          // Activar la primera pregunta después de que `this.questions` se haya actualizado
          if (this.questions.length > 0) {
              this.setActiveQuestion(this.questions[0].id, this.questions[0]._tempId);
          }


          this.lastSavedState = this.getCurrentStateSnapshot();
          this.hasUnsavedChanges = false;

        } else {
            this.isSurveyPublished = false;
            this.initializeNewSurveyWithDefaults();
        }
      },
      error: (err) => {
        console.error('Error al cargar la encuesta:', err);
        this.showToast('No se pudo cargar la encuesta. Intente nuevamente.', true);
        this.isSurveyPublished = false;
        this.initializeNewSurveyWithDefaults();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCurrentStateSnapshot(): string {
    return JSON.stringify({
      nombre: this.nombreEncuesta,
      questions: this.questions.map(q => ({
        id: q.id,
        _tempId: q._tempId, // Para nuevas preguntas
        text: q.text,
        type: q.type,
        numero: q.numero,
        options: q.options ? q.options.map(opt => ({ 
            id: opt.id, // Importante para la comparación
            _tempId: opt._tempId, // Para nuevas opciones
            texto: opt.texto, 
            numero: opt.numero 
        })) : []
      }))
    });
  }

  private checkForChanges(): void {
    if (this.isSurveyPublished) {
      this.hasUnsavedChanges = false;
      return;
    }
    const currentState = this.getCurrentStateSnapshot();
    this.hasUnsavedChanges = currentState !== this.lastSavedState;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Solo mostrar si hay cambios y no es una encuesta publicada ya cargada
    if (this.hasUnsavedChanges && !this.isSurveyPublished) {
      $event.returnValue = true;
    }
  }

  setActiveQuestion(questionId?: number, tempId?: number) {
    if (this.isSurveyPublished && this.isEditMode) return;

    this.questions.forEach((q) => {
      q.active = (questionId !== undefined && q.id === questionId) || (tempId !== undefined && q._tempId === tempId);
      q.showMenu = false;
      if (q.active && (q.type === 'multiple_choice' || q.type === 'checkbox' || q.type === 'radio')) {
        this.currentOptions = q.options ? [...q.options] : [];
        const typesWithOptions = ['multiple_choice', 'checkbox', 'radio'];
        if (this.currentOptions.length === 0 && typesWithOptions.includes(q.type)) { // Solo añadir opciones a tipos que las usan
            this.currentOptions = [{ texto: 'Opción 1', numero: 1, _tempId: Date.now()+1 }, { texto: 'Opción 2', numero: 2, _tempId: Date.now()+2 }];
            q.options = [...this.currentOptions];
        }
      }
    });
  }

  addOption() {
    if (this.isSurveyPublished) return;
    if (this.activeQuestion) {
      if (!this.activeQuestion.options) {
        this.activeQuestion.options = [];
      }
      const newOptionNumber = this.activeQuestion.options.length + 1;
      const newOption: Option = {
        _tempId: Date.now() + Math.random(),
        texto: `Opción ${newOptionNumber}`,
        numero: newOptionNumber
      };
      this.activeQuestion.options.push(newOption);
      this.currentOptions = [...this.activeQuestion.options];
      this.draftService.updateQuestions(this.questions);
    }
  }

  removeOption(index: number) {
    if (this.isSurveyPublished) return;
    if (this.activeQuestion && this.activeQuestion.options && this.activeQuestion.options[index]) {
      this.activeQuestion.options.splice(index, 1);
      this.activeQuestion.options.forEach((opt, idx) => opt.numero = idx + 1);
      this.currentOptions = [...this.activeQuestion.options];
      this.draftService.updateQuestions(this.questions);
    }
  }

  openAddQuestionModal() {
    if (this.isSurveyPublished) return;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  duplicateQuestion(questionId?: number, tempId?: number) {
    if (this.isSurveyPublished) return;
    const questionToDuplicate = this.questions.find((q) => (questionId !== undefined && q.id === questionId) || (tempId !== undefined && q._tempId === tempId));
    if (questionToDuplicate) {
      const newTempIdForDuplicated = Date.now() + Math.random();
      const newQuestionNumber = this.questions.length + 1; // Asignar número basado en la nueva posición
      const duplicated: Question = {
        ...questionToDuplicate,
        id: undefined,
        _tempId: newTempIdForDuplicated,
        active: false,
        showMenu: false,
        numero: newQuestionNumber, 
        options: questionToDuplicate.options?.map(opt => ({ 
            ...opt, 
            id: undefined, 
            _tempId: Date.now() + Math.random() + (opt.numero || 0) 
        })) || []
      };
      this.draftService.addQuestion(duplicated);
      // La activación se manejará por la suscripción si es necesario, o llamar setActiveQuestion aquí
       setTimeout(() => this.setActiveQuestion(undefined, newTempIdForDuplicated), 0);
    }
  }
  
  deleteQuestion(questionId?: number, tempId?: number) {
    if (this.isSurveyPublished) return;
    const questionIndex = this.questions.findIndex(q => 
        (questionId !== undefined && q.id === questionId) || 
        (tempId !== undefined && q._tempId === tempId)
    );

    if (questionIndex > -1) {
        const questionToDelete = this.questions[questionIndex];
        if (questionToDelete.id) {
            this.preguntasAEliminar.push(questionToDelete.id);
        }
        const updatedQuestions = this.questions.filter((q, index) => index !== questionIndex)
                                       .map((q, idx) => ({ ...q, numero: idx + 1 })); // Re-numerar
        
        this.draftService.updateQuestions(updatedQuestions);

        if (questionToDelete.active && updatedQuestions.length > 0) {
            this.setActiveQuestion(updatedQuestions[0].id, updatedQuestions[0]._tempId);
        } else if (updatedQuestions.length === 0) {
            this.currentOptions = [];
        }
    }
  }

  addQuestion(type: string) {
    if (this.isSurveyPublished) return;
    const newTempId = Date.now() + Math.random();
    const newQuestionNumber = this.questions.length + 1;
    const newQuestion: Question = {
      _tempId: newTempId,
      text: `Nueva pregunta (${type})`,
      type: type,
      active: false,
      showMenu: false,
      numero: newQuestionNumber,
    };

    if (type === 'multiple_choice' || type === 'checkbox' || type === 'radio') {
      newQuestion.options = [
        { texto: 'Opción 1', numero: 1, _tempId: Date.now() + 1 },
        { texto: 'Opción 2', numero: 2, _tempId: Date.now() + 2 }
      ];
    }
    this.draftService.addQuestion(newQuestion);
    setTimeout(() => {
        const addedQuestion = this.questions.find(q => q._tempId === newTempId);
        if (addedQuestion) {
            this.setActiveQuestion(undefined, addedQuestion._tempId);
        }
    }, 0);
    
    this.closeModal();
    this.mobileSidebarOpen = false;
  }

  closeAllMenus() {
    this.questions.forEach((q) => (q.showMenu = false));
  }

  onOptionChange(index: number) {
    if (this.isSurveyPublished) return;
    if (this.activeQuestion) {
      this.activeQuestion.options = [...this.currentOptions];
      this.draftService.updateQuestions(this.questions);
    }
  }

  onQuestionTextChange() {
    if (this.isSurveyPublished) return;
    this.draftService.updateQuestions(this.questions);
  }

  onNombreEncuestaChange() {
    if (this.isSurveyPublished) return;
    this.checkForChanges();
  }

  clearDraft() {
    if (this.isSurveyPublished) return;
    this.preguntasAEliminar = [];
    this.currentOptions = [];
    this.initializeNewSurveyWithDefaults();
  }
  
  getTokenFromCookie(nombre: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + nombre + '=([^;]+)'));
    return match ? match[2] : null;
  }

  private validarEncuesta(): boolean {
    if (!this.nombreEncuesta || this.nombreEncuesta.trim().length < 3) {
      this.showToast('Nombre de encuesta inválido (mínimo 3 caracteres).', true);
      return false;
    }
    if (this.questions.length === 0) {
      this.showToast('Debe agregar al menos una pregunta.', true);
      return false;
    }
    for (const [index, question] of this.questions.entries()) {
      if (!question.numero) { // Si una pregunta no tiene número asignado
          question.numero = index + 1; // Asignar basado en el índice
      }
      if (!question.text || question.text.trim().length < 5) {
        this.showToast(`Pregunta ${question.numero}: mínimo 5 caracteres.`, true);
        this.setActiveQuestion(question.id, question._tempId);
        return false;
      }
      if ((question.type === 'radio' || question.type === 'checkbox' || question.type === 'multiple_choice') &&
          (!question.options || question.options.length < 2)) {
        this.showToast(`Pregunta ${question.numero}: necesita al menos 2 opciones.`, true);
        this.setActiveQuestion(question.id, question._tempId);
        return false;
      }
      if (question.options) {
        for (const opt of question.options) {
          if (!opt.texto || opt.texto.trim() === "") {
            this.showToast(`Una opción en la pregunta ${question.numero} está vacía.`, true);
            this.setActiveQuestion(question.id, question._tempId);
            return false;
          }
        }
      }
    }
    return true;
  }

  // Método para guardar una NUEVA encuesta
  guardarEncuesta() {
    if (this.isSurveyPublished) {
      this.showToast('No se puede guardar una encuesta ya publicada.', true); return;
    }
    // Asegurar que los números de las preguntas estén correctos ANTES de validar
    this.questions.forEach((q, index) => q.numero = index + 1);

    if (!this.validarEncuesta()) return;
    this.isSaving = true;

    const preguntasParaBackend = this.questions.map(q => ({
      numero: q.numero,
      texto: q.text,
      tipo: this.mapTipoFrontToBack(q.type),
      opciones: q.options?.map(opt => ({
        texto: opt.texto,
        numero: opt.numero 
      })) || [] 
    }));

    const encuestaPayload = {
      nombre: this.nombreEncuesta.trim(),
      preguntas: preguntasParaBackend,
    };

    if (!this.tokenDashboard) {
      this.showToast('Error de autenticación.', true); this.isSaving = false; return;
    }

    this.encuestasService.crearEncuesta(encuestaPayload, this.tokenDashboard).subscribe({
      next: (resp) => {
        if (resp && resp.data && resp.data.id && resp.data.preguntas) {
          this.currentEncuestaId = resp.data.id; 
          this.isEditMode = true; 

          const preguntasDesdeBackend = resp.data.preguntas.map((pBack: any) => {
            // Mapear usando el número de pregunta que el backend devuelve (debería coincidir)
            const qOriginal = this.questions.find(qFE => qFE.numero === pBack.numero); 
            return {
              ...qOriginal, 
              id: pBack.id, 
              _tempId: undefined, 
              texto: pBack.texto, 
              type: this.mapTipoBackToFront(pBack.tipo),
              numero: pBack.numero, 
              options: (pBack.opciones || []).map((optBack: any) => {
                const oOriginal = qOriginal?.options?.find(oFE => oFE.numero === optBack.numero);
                return {
                  ...oOriginal,
                  id: optBack.id,
                  _tempId: undefined,
                  texto: optBack.texto,
                  numero: optBack.numero,
                };
              })
            };
          });
          this.draftService.updateQuestions(preguntasDesdeBackend as Question[]);
          this.preguntasAEliminar = []; 
        }
        this.isSaving = false;
        this.lastSavedState = this.getCurrentStateSnapshot(); 
        this.hasUnsavedChanges = false; 
        this.showToast('¡Encuesta guardada como borrador!');
        this.router.navigate(['/create', this.currentEncuestaId], { queryParamsHandling: 'preserve' });
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(err.error?.message || 'Error al guardar.', true);
      }
    });
  }

  // Método para ACTUALIZAR una encuesta existente
  actualizarEncuesta() {
    if (this.isSurveyPublished) {
      this.showToast('No se puede actualizar una encuesta ya publicada.', true); return;
    }
     // Asegurar que los números de las preguntas estén correctos ANTES de validar
    this.questions.forEach((q, index) => q.numero = index + 1);
    
    if (!this.validarEncuesta() || !this.currentEncuestaId) return;
    this.isSaving = true;

    // Para ACTUALIZAR, NO enviar 'numero' en el objeto pregunta
    const preguntasParaBackend = this.questions.map(q => ({
      id: q.id, 
      texto: q.text,
      tipo: this.mapTipoFrontToBack(q.type),
      opciones: q.options?.map(opt => ({
        id: opt.id, 
        texto: opt.texto,
        numero: opt.numero
      })) || []
    }));

    const payload = {
      nombre: this.nombreEncuesta,
      preguntas: preguntasParaBackend,
      preguntas_a_eliminar: this.preguntasAEliminar.length > 0 ? this.preguntasAEliminar : undefined,
    };
    
    if (!this.tokenDashboard) {
      this.showToast('Error de autenticación.', true); this.isSaving = false; return;
    }

    this.encuestasService.updateEncuesta(this.tokenDashboard, this.currentEncuestaId, payload).subscribe({
      next: (resp) => {
         if (resp && resp.data && resp.data.preguntas) { 
          const preguntasDesdeBackend = resp.data.preguntas.map((pBack: any) => {
            // Al actualizar, el backend devuelve preguntas con 'numero', así que lo usamos para mapear
            const qOriginal = this.questions.find(qFE => qFE.id === pBack.id || qFE.numero === pBack.numero);
            return {
              ...qOriginal,
              id: pBack.id,
              _tempId: undefined,
              text: pBack.texto,
              type: this.mapTipoBackToFront(pBack.tipo),
              numero: pBack.numero, // Usar número del backend para mantener consistencia
              options: (pBack.opciones || []).map((optBack: any) => {
                 const oOriginal = qOriginal?.options?.find(oFE => oFE.id === optBack.id || oFE.numero === optBack.numero);
                return {
                    ...oOriginal,
                    id: optBack.id,
                    _tempId: undefined,
                    texto: optBack.texto,
                    numero: optBack.numero,
                };
              })
            };
          });
          this.draftService.updateQuestions(preguntasDesdeBackend as Question[]);
          this.preguntasAEliminar = [];
        }
        this.isSaving = false;
        this.lastSavedState = this.getCurrentStateSnapshot();
        this.hasUnsavedChanges = false;
        this.showToast('¡Encuesta actualizada!');
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(err.error?.message || 'Error al actualizar.', true);
      }
    });
  }

  trackByPreguntaKey(index: number, item: Question): any {
    return item.id ?? item._tempId ?? index;
  }

  get activeQuestionNumber(): number {
    const activeQ = this.activeQuestion;
    if (!activeQ) return 0;
    // Utilizar el número de pregunta asignado si existe, sino el índice
    return activeQ.numero ?? (this.questions.findIndex(q => (q.id && q.id === activeQ.id) || (q._tempId && q._tempId === activeQ._tempId)) + 1);
  }

  mapTipoBackToFront(tipo: string): string {
    switch (tipo) {
      case 'ABIERTA': return 'text';
      case 'OPCION_MULTIPLE_SELECCION_SIMPLE': return 'radio';
      case 'OPCION_MULTIPLE_SELECCION_MULTIPLE': return 'checkbox';
      default: return 'text';
    }
  }

  mapTipoFrontToBack(type: string): string {
    switch (type) {
      case 'text': return 'ABIERTA';
      case 'radio': return 'OPCION_MULTIPLE_SELECCION_SIMPLE';
      case 'checkbox': return 'OPCION_MULTIPLE_SELECCION_MULTIPLE';
      default: return 'ABIERTA';
    }
  }

  closeReadOnlyModalAndGoToDashboard() {
    this.showReadOnlyModal = false;
    if (this.tokenDashboard) {
      this.router.navigate(['/dashboard'], { queryParams: { token: this.tokenDashboard } });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  closeReadOnlyModalAndGoToResults() {
    this.showReadOnlyModal = false;
    if (this.currentEncuestaId) {
      this.router.navigate(['/results', this.currentEncuestaId]);
    } else {
      this.closeReadOnlyModalAndGoToDashboard();
    }
  }
}
