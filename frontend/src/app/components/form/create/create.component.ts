import { Component } from '@angular/core';
import {
  LucideAngularModule,
  Plus, Eye, ChevronDown, ChevronUp, ListChecks, Calendar,
  TextCursorInput, Mail, Phone, Image, Video, CheckSquare,
  Circle, X, MoreVertical, Copy, Trash2,
  Check
} from 'lucide-angular';
import { HeaderFormComponent } from '../../header/header-form/header-form.component';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';

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
  imports: [HeaderFormComponent, LucideAngularModule, ModalCreateComponent, CommonModule, TruncatePipe],
  templateUrl: './create.component.html'
})
export class CreateComponent {
  // Iconos disponibles
  // En tus imports de Lucide
  icons = {
    Plus, Eye, ChevronDown, ChevronUp, ListChecks, Calendar,
    TextCursorInput, Mail, Phone, Image, Video, CheckSquare,
    Circle, X, MoreVertical, Copy, Trash2, Check // Agrega Check
  };

  // Estado del sidebar móvil
  mobileSidebarOpen = false;

  // Mapeo de tipos de pregunta a iconos
  questionTypeIcons: { [key: string]: any } = {
    'multiple_choice': this.icons.ListChecks,
    'text': this.icons.TextCursorInput,
    'date': this.icons.Calendar,
    'email': this.icons.Mail,
    'phone': this.icons.Phone,
    'image': this.icons.Image,
    'video': this.icons.Video,
    'checkbox': this.icons.CheckSquare,
    'radio': this.icons.Circle
  };

  // Estado del modal
  showModal = false;

  // Preguntas del formulario con tipo Question
  questions: Question[] = [
    {
      id: 1,
      text: 'Nueva pregunta de selección múltiple',
      type: 'multiple_choice',
      active: true,
      showMenu: false,
      options: ['Opción 1', 'Opción 2'],
      required: false
    }
  ];

  // Opciones para la pregunta activa
  currentOptions: string[] = [];

  // Getter para obtener la pregunta activa
  get activeQuestion() {
    return this.questions.find(q => q.active);
  }

  // Activa una pregunta específica
  setActiveQuestion(questionId: number) {
    this.questions.forEach(q => {
      q.active = q.id === questionId;
      q.showMenu = false;
      if (q.active && (q.type === 'multiple_choice' || q.type === 'checkbox' || q.type === 'radio')) {
        this.currentOptions = q.options ? [...q.options] : ['Opción 1', 'Opción 2'];
      }
    });
  }

  // Método para añadir una nueva opción
  addOption() {
    if (this.activeQuestion &&
      (this.activeQuestion.type === 'multiple_choice' ||
        this.activeQuestion.type === 'checkbox' ||
        this.activeQuestion.type === 'radio')) {
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
    if (this.activeQuestion &&
      (this.activeQuestion.type === 'multiple_choice' ||
        this.activeQuestion.type === 'checkbox' ||
        this.activeQuestion.type === 'radio')) {
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
    const questionToDuplicate = this.questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const newId = Math.max(...this.questions.map(q => q.id)) + 1;
      this.questions.push({
        ...questionToDuplicate,
        id: newId,
        active: false,
        showMenu: false
      });
    }
  }

  // Método para borrar pregunta
  deleteQuestion(questionId: number) {
    this.questions = this.questions.filter(q => q.id !== questionId);
    // Si borramos la pregunta activa, seleccionamos la primera disponible
    if (this.questions.length > 0 && !this.activeQuestion) {
      this.setActiveQuestion(this.questions[0].id);
    }
  }

  // Añade una nueva pregunta del tipo seleccionado
  addQuestion(type: string) {
    const newId = this.questions.length > 0 ? Math.max(...this.questions.map(q => q.id)) + 1 : 1;
    const defaultTexts = {
      'multiple_choice': 'Nueva pregunta de opción múltiple',
      'text': 'Nueva pregunta de texto abierto',
      'date': 'Nueva pregunta de fecha',
      'email': 'Nueva pregunta de email',
      'phone': 'Nueva pregunta de teléfono',
      'image': 'Nueva pregunta con imagen',
      'video': 'Nueva pregunta con video',
      'checkbox': 'Nueva pregunta con casillas',
      'radio': 'Nueva pregunta con botones de radio'
    };

    const newQuestion: Question = {
      id: newId,
      text: defaultTexts[type as keyof typeof defaultTexts] || 'Nueva pregunta',
      type: type,
      active: false,
      showMenu: false,
      required: false // Inicializar como no requerida
    };

    // Inicializar opciones para preguntas que las necesiten
    if (type === 'multiple_choice' || type === 'checkbox' || type === 'radio') {
      newQuestion.options = ['Opción 1', 'Opción 2'];
      this.currentOptions = [...newQuestion.options];
    }

    this.questions.push(newQuestion);
    this.setActiveQuestion(newId);
    this.closeModal();
    this.mobileSidebarOpen = false; // Cerrar el sidebar móvil después de añadir
  }

  // Cierra todos los menús abiertos
  closeAllMenus() {
    this.questions.forEach(q => q.showMenu = false);
  }

  // Método para alternar el estado de obligatoriedad
  toggleQuestionRequired() {
    if (this.activeQuestion) {
      this.activeQuestion.required = !this.activeQuestion.required;
    }
  }
}