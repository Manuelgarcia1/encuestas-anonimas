import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, QrCode, Mail } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { EncuestasService } from '../../../../services/encuestas.service';
import QRCode from 'qrcode';
import { switchMap } from 'rxjs/operators'; // Importa switchMap
import { TokenParticipacionResponse } from '../../../../interfaces/encuesta-response.interface';

@Component({
  selector: 'app-modal-publicar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './modal-publicar.component.html',
})
export class ModalPublicarComponent implements OnInit {
  @Input() encuestaId!: number;
  surveyName: string = 'Encuesta'; // Valor inicial o por defecto
  @Output() close = new EventEmitter<void>();

  icons = { X, QrCode, Mail };
  surveyLink = '';
  isLoading = true; // Iniciar como true ya que cargaremos datos
  qrCodeImageUrl: string | null = null;
  isGeneratingQr = false;

  constructor(private encuestasService: EncuestasService) { }

  ngOnInit() {
    this.loadSurveyData();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  loadSurveyData() {
    this.isLoading = true;
    const tokenDashboard = this.getCookie('td');

    if (!tokenDashboard) {
      this.showToast('No se encontró el token de dashboard. No se pueden cargar los datos de la encuesta.', true);
      this.isLoading = false;
      this.closeModal();
      return;
    }

    // Primero obtenemos el token de participación
    this.encuestasService.getTokenParticipacion(tokenDashboard, this.encuestaId).pipe(
      switchMap((responseParticipacion: TokenParticipacionResponse) => {
        if (responseParticipacion && responseParticipacion.data && responseParticipacion.data.token_respuesta) {
          this.surveyLink = `http://localhost/response/${responseParticipacion.data.token_respuesta}`;
        } else {
          // Si no hay token_respuesta, lanzamos un error para que lo capture el bloque 'error'
          throw new Error('No se pudo obtener el token de participación.');
        }
        // Después de obtener el link, obtenemos los detalles de la encuesta (incluido el nombre)
        return this.encuestasService.getEncuestaPorId(tokenDashboard, this.encuestaId);
      })
    ).subscribe({
      next: (responseEncuesta) => {
        if (responseEncuesta && responseEncuesta.data && responseEncuesta.data.nombre) {
          this.surveyName = responseEncuesta.data.nombre; // Aquí actualizamos el nombre real de la encuesta
        } else {
          // Si no viene el nombre, mantenemos el valor por defecto o un genérico
          this.surveyName = 'Encuesta';
          console.warn('Nombre de la encuesta no encontrado, usando valor por defecto.');
        }
        // Si llegamos aquí, surveyLink se estableció y surveyName también (o su defecto).
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos de la encuesta:', err);
        // Determinar qué falló para el mensaje
        if (!this.surveyLink) {
          this.showToast('Error al obtener el enlace de participación.', true);
        } else {
          // El enlace se obtuvo, pero falló al obtener el nombre.
          this.showToast('Error al obtener el nombre de la encuesta. Se usará un nombre genérico.', true);
          // Mantenemos el surveyName por defecto si la obtención del nombre falló.
        }
        this.isLoading = false;
        // Si el surveyLink es esencial y falla
        if (!this.surveyLink) { this.closeModal(); }
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
    toast.className = `fixed bottom-5 right-5 p-4 rounded-md text-white shadow-lg transition-opacity duration-300 ${isError ? 'bg-red-500' : 'bg-blue-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2700);
  }

  async generateQR() {
    if (this.qrCodeImageUrl) {
      this.qrCodeImageUrl = null;
      return;
    }

    if (!this.surveyLink) {
      this.showToast('Primero se debe generar el enlace de participación.', true);
      return;
    }

    this.isGeneratingQr = true;
    try {
      const options = {
        errorCorrectionLevel: 'H' as const,
        type: 'image/png' as const,
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        },
        width: 200
      };
      this.qrCodeImageUrl = await QRCode.toDataURL(this.surveyLink, options);
    } catch (err) {
      console.error('Error al generar QR:', err);
      this.showToast('Error al generar el código QR', true);
    } finally {
      this.isGeneratingQr = false;
    }
  }

  shareByEmail() {
    if (!this.surveyLink) {
      this.showToast('Primero se debe generar el enlace de participación.', true);
      return;
    }

    const subject = `¡Tu opinión es importante! Participa en nuestra encuesta: ${this.surveyName}`;

    const body = `¡Hola!

Te invitamos cordialmente a participar en nuestra encuesta: "${this.surveyName}".
Tu opinión y perspectiva son muy valiosas para nosotros y nos ayudarán a mejorar.

Para acceder a la encuesta, simplemente haz clic en el siguiente enlace:
${this.surveyLink}

Si el enlace no funciona, por favor cópialo y pégalo en la barra de direcciones de tu navegador.

Completar la encuesta te tomará solo unos minutos. Apreciamos de antemano tu tiempo y colaboración.

¡Muchas gracias!

Saludos cordiales,
El grupo E de Desarrollo de Aplicaciones Web 2025`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  }

  closeModal() {
    this.qrCodeImageUrl = null;
    this.close.emit();
  }
}
