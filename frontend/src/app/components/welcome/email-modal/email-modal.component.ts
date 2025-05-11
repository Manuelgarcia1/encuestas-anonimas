import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, X, Mail } from 'lucide-angular';

@Component({
  selector: 'app-email-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './email-modal.component.html',
})
export class EmailModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  email: string = '';
  
  // Iconos disponibles para el template
  icons = { X, Mail };

  constructor(private router: Router) {}

  onSubmit() {
    // Validación básica
    if (this.email && this.email.includes('@')) {
      // Aquí iría la lógica para enviar el email
      this.router.navigate(['/dashboard']);
    }
  }

  onClose() {
    this.closeModal.emit();
  }
}