import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  BarChart3,
  ListChecks,
  CheckSquare,
  MessageSquareText,
  AlertCircle,
  Users,
  ClipboardList,
  Loader2,
  ClipboardX // <--- Nuevo icono para el estado sin respuestas
} from 'lucide-angular';
import { HeaderFormComponent } from '../header/header-form/header-form.component';
import { EncuestasService } from '../../services/encuestas.service';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HeaderFormComponent
  ],
  templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit {
  icons = {
    BarChart3,
    ListChecks,
    CheckSquare,
    MessageSquareText,
    AlertCircle,
    Users,
    ClipboardList,
    Loader2,
    ClipboardX // <--- Añadido el icono
  };

  encuestaId: number | null = null;
  tokenDashboard: string | null = null;
  datosEstadisticas: any | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encuestasService: EncuestasService
  ) {}

  ngOnInit(): void {
    this.tokenDashboard = this.getCookie('td');

    this.route.paramMap.pipe(
      switchMap(params => {
        const idStr = params.get('id');
        if (!idStr) {
          this.handleErrorAndNavigate("No se proporcionó un ID de encuesta en la ruta.");
          return of(null);
        }
        this.encuestaId = +idStr;
        if (isNaN(this.encuestaId)) {
          this.handleErrorAndNavigate("El ID de encuesta proporcionado no es válido.");
          return of(null);
        }

        if (!this.tokenDashboard) {
          this.handleErrorAndNavigate("No se encontró el token de autenticación del dashboard (cookie 'td').");
          return of(null);
        }
        return this.loadEstadisticas();
      })
    ).subscribe();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private loadEstadisticas() {
    if (!this.encuestaId || !this.tokenDashboard) return of(null);

    this.isLoading = true;
    this.errorMessage = null;
    this.datosEstadisticas = null;

    return this.encuestasService.getEncuestaPorId(this.tokenDashboard, this.encuestaId).pipe(
      switchMap(encuestaDetalleResponse => {
        if (!encuestaDetalleResponse?.data?.token_resultados) {
          this.handleError('No se pudo obtener el token de resultados para la encuesta.');
          return of(null);
        }
        const tokenResultados = encuestaDetalleResponse.data.token_resultados;

        return this.encuestasService.getEstadisticasPorTokenResultados(tokenResultados).pipe(
          tap(estadisticasResponse => {
            if (estadisticasResponse?.status === 'success' && estadisticasResponse?.data?.encuesta) {
              this.datosEstadisticas = estadisticasResponse.data;
            } else {
              this.handleError('No se pudieron obtener los datos de estadísticas o el formato es incorrecto.');
            }
            this.isLoading = false;
          }),
          catchError(err => {
            const apiError = err.error?.message || 'Error al cargar las estadísticas de la encuesta.';
            this.handleError(apiError, err);
            return of(null);
          })
        );
      }),
      catchError(err => {
        const apiError = err.error?.message || 'Error al cargar la información inicial de la encuesta.';
        this.handleError(apiError, err);
        return of(null);
      })
    );
  }

  // Getter para filtrar las preguntas que se mostrarán
  get preguntasVisibles(): any[] {
    if (!this.datosEstadisticas?.encuesta?.preguntas) {
      return [];
    }
    return this.datosEstadisticas.encuesta.preguntas.filter((pregunta: any) =>
      pregunta.tipo !== 'ABIERTA' || (pregunta.tipo === 'ABIERTA' && pregunta.respuestas && pregunta.respuestas.length > 0)
    );
  }

  private handleError(message: string, error?: any): void {
    this.errorMessage = message;
    this.isLoading = false;
    if (error) console.error(message, error);
    else console.error(message);
  }

  private handleErrorAndNavigate(message: string, error?: any): void {
    this.handleError(message, error);
  }

  getQuestionTypeDescription(tipoApi: string): string {
    switch (tipoApi) {
      case 'OPCION_MULTIPLE_SELECCION_SIMPLE': return 'Opción Múltiple (Selección Simple)';
      case 'OPCION_MULTIPLE_SELECCION_MULTIPLE': return 'Opción Múltiple (Selección Múltiple)';
      case 'ABIERTA': return 'Respuesta Abierta';
      default: return 'Tipo Desconocido';
    }
  }

  getQuestionIcon(tipoApi: string | undefined): any {
    if (!tipoApi) return this.icons.ClipboardList;
    switch (tipoApi) {
      case 'OPCION_MULTIPLE_SELECCION_SIMPLE': return this.icons.ListChecks;
      case 'OPCION_MULTIPLE_SELECCION_MULTIPLE': return this.icons.CheckSquare;
      case 'ABIERTA': return this.icons.MessageSquareText;
      default: return this.icons.ClipboardList;
    }
  }
}
