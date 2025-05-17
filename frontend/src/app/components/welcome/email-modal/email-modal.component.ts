import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, X, Mail } from 'lucide-angular';
import { CreadoresService } from '../../../services/creadores.service';

@Component({
  selector: 'app-email-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './email-modal.component.html',
})
export class EmailModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  email: string = '';
  loading = false;
  error: string | null = null;

  icons = { X, Mail };

  constructor(private router: Router, private creadoresService: CreadoresService) {}

  onSubmit() {
  if (this.email && this.email.includes('@')) {
    this.loading = true;
    this.error = null;
    this.creadoresService.requestAccess(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        // usa el mensaje principal del backend
        const message = response?.message || response?.data?.message || 'Operación realizada con éxito.';
        alert(message);
        const token = response?.data?.token;
        if (token) {
          this.router.navigate(['/dashboard'], { queryParams: { token } });
        } else {
          // si no hay token, cierra el modal y recarga la página
          this.onClose();
          window.location.reload();
        }
      },
      error: (err: unknown) => {
        this.loading = false;
        this.error = 'Error al enviar el email. Intenta de nuevo.';
        console.error('Error en la petición:', err);
      }
    });
  } else {
    console.warn('Email inválido:', this.email);
  }
}

  onClose() {
    this.closeModal.emit();
  }
}
