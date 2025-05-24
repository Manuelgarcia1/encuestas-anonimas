import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, QrCode, Mail } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { EncuestasService } from '../../../../services/encuestas.service';


@Component({
  selector: 'app-modal-publicar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './modal-publicar.component.html',
})
export class ModalPublicarComponent {
  @Input() encuestaId!: number; // ID de la encuesta a publicar
  @Output() close = new EventEmitter<void>();

  icons = { X, QrCode, Mail };
  surveyLink = '';
  isLoading = false;

  constructor(private encuestasService: EncuestasService) {}

  ngOnInit() {
    this.getTokenParticipacion();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  getTokenParticipacion() {
    this.isLoading = true;
    const tokenDashboard = this.getCookie('td');
    
    if (!tokenDashboard) {
      this.showToast('No se encontró el token de dashboard', true);
      this.closeModal();
      return;
    }

    this.encuestasService.getTokenParticipacion(tokenDashboard, this.encuestaId).subscribe({
      next: (response: any) => {
        this.surveyLink = `http://localhost:4200/response/${response.data.token_respuesta}`;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener token:', err);
        this.showToast('Error al obtener el enlace de participación', true);
        this.isLoading = false;
      }
    });
  }

  copyLink() {
    if (!this.surveyLink) return;
    
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

  generateQR() {
    console.log('Generando QR para:', this.surveyLink);
    // Implementar generación de QR aquí
  }

  shareByEmail() {
    if (!this.surveyLink) return;
    
    const subject = 'Encuesta GAMERS';
    const body = `Por favor completa esta encuesta: ${this.surveyLink}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  }

  closeModal() {
    this.close.emit();
  }
}
