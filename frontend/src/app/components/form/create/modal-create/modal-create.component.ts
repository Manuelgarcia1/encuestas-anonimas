import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ListChecks, TextCursorInput, CheckSquare, Circle, X } from 'lucide-angular';

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

  icons = { 
    ListChecks, 
    TextCursorInput, 
    CheckSquare, 
    Circle, 
    X
  };

  // Solo los tipos de pregunta solicitados
  questionTypes = [
    { type: 'text', label: 'Texto abierto', icon: this.icons.TextCursorInput },
    { type: 'radio', label: 'Selección simple', icon: this.icons.Circle },
    { type: 'checkbox', label: 'Selección múltiple', icon: this.icons.CheckSquare }
  ];

  selectQuestionType(type: string) {
    this.questionTypeSelected.emit(type);
    this.closeModal.emit();
  }
}