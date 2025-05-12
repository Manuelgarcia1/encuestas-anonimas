import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ListChecks, TextCursorInput, Calendar, Mail, Phone, Image, Video, CheckSquare, Circle, X } from 'lucide-angular';

@Component({
  selector: 'app-modal-create',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './modal-create.component.html',
  styles: [`
    .modal-overlay {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .modal-container {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ModalCreateComponent {
  @Output() questionTypeSelected = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter<void>();

  // Asegúrate de incluir el icono X en el objeto icons
  icons = { 
    ListChecks, 
    TextCursorInput, 
    Calendar, 
    Mail, 
    Phone, 
    Image, 
    Video, 
    CheckSquare, 
    Circle, 
    X // Icono de cierre
  };

  questionTypes = [
    { type: 'multiple_choice', label: 'Opción múltiple', icon: this.icons.ListChecks },
    { type: 'text', label: 'Texto abierto', icon: this.icons.TextCursorInput },
    { type: 'date', label: 'Fecha', icon: this.icons.Calendar },
    { type: 'email', label: 'Email', icon: this.icons.Mail },
    { type: 'phone', label: 'Teléfono', icon: this.icons.Phone },
    { type: 'image', label: 'Imagen', icon: this.icons.Image },
    { type: 'video', label: 'Video', icon: this.icons.Video },
    { type: 'checkbox', label: 'Casillas de verificación', icon: this.icons.CheckSquare },
    { type: 'radio', label: 'Botones de radio', icon: this.icons.Circle }
  ];

  selectQuestionType(type: string) {
    this.questionTypeSelected.emit(type);
    this.closeModal.emit();
  }
}