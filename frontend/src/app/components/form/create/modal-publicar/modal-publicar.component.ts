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
  surveyLink = 'https://www.gamers.com/add.html';

  // Evento para cerrar el modal
  @Output() close = new EventEmitter<void>();

  // Método para copiar el link al portapapeles
  copyLink() {
    navigator.clipboard.writeText(this.surveyLink)
      .then(() => {
        console.log('Link copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar el link:', err);
      });
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