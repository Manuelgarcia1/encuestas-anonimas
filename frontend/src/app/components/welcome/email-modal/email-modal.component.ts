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

  private isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit() {
    if (!this.isEmailValid(this.email)) {
      this.showToast('Email inválido. Intenta con otro.', true);
      return;
    }

    this.loading = true;
    this.error = null;

    this.creadoresService.requestAccess(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        const token = response?.data?.token;
        const message = response?.message || 'Operación realizada con éxito.';

        this.showToast(message, false);

        if (token) {
          setTimeout(() => {
            this.router.navigate(['/dashboard'], { queryParams: { token } });
          }, 1200);
        } else {
          this.onClose();
        }
      },
      error: (err) => {
        this.loading = false;
        this.showToast('Error al enviar el email. Intenta nuevamente.', true);
        console.error('Error en la petición:', err);
      }
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  private showToast(message: string, isError: boolean = false) {
    const toast = document.createElement('div');
    toast.className = `
      toast
      ${isError ? 'bg-red-500' : 'bg-green-500'}
      text-white px-4 py-2 rounded shadow fixed bottom-4 right-4 z-[1000] animate-fade-in
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
