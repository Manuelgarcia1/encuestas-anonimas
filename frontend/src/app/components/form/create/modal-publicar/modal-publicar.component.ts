import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, QrCode, Mail } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-publicar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './modal-publicar.component.html',
})
export class ModalPublicarComponent {
  // Iconos disponibles
  icons = { X, QrCode, Mail };

  // Link de la encuesta (ejemplo)
  surveyLink = 'http://localhost:4200/response';

  // Evento para cerrar el modal
  @Output() close = new EventEmitter<void>();

  copyLink() {
    navigator.clipboard.writeText(this.surveyLink)
      .then(() => {
        this.showToast('¡Link copiado con éxito!');
      })
      .catch(err => {
        console.error('Error al copiar el link:', err);
        this.showToast('Error al copiar el link', true);
      });
  }

  private showToast(message: string, isError: boolean = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'bg-red-500' : 'bg-blue-500'} text-white p-2 rounded fixed bottom-2 right-2 z-1000`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Método para generar QR
  generateQR() {
    console.log('Generando QR para:', this.surveyLink);
  }

  // Método para compartir por email
  shareByEmail() {
    const subject = 'Encuesta GAMERS';
    const body = `Por favor completa esta encuesta: ${this.surveyLink}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  }

  // Método para cerrar el modal
  closeModal() {
    this.close.emit();
  }
}
