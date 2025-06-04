// src/app/components/form/results/results.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule, ChevronDown, ListChecks, TextCursorInput,
  CheckSquare, Calendar, BarChart3, Percent, Users, MessageSquareText, AlertCircle
} from 'lucide-angular';
import { HeaderFormComponent } from '../../header/header-form/header-form.component';
import { EncuestasService } from '../../../services/encuestas.service';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  ResultadosPorTokenResultadosResponse,
  ApiResultadosIndividuales,
  RespuestaIndividualAPregunta,
  ConjuntoDeRespuestas
} from '../../../interfaces/resultados.interface';



@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HeaderFormComponent],
  templateUrl: './results.component.html',
  styles: ``
})
export class ResultsComponent implements OnInit {
  icons = {
    ListChecks, TextCursorInput, CheckSquare, ChevronDown, Calendar,
    BarChart3, Percent, Users, MessageSquareText, AlertCircle
  };

  encuestaId: number | null = null;
  tokenDashboard: string | null = null;

  // Usa la nueva interfaz para los datos de la API
  datosResultados: ApiResultadosIndividuales | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Estas son las preguntas que irán en el encabezado de la tabla
  preguntasEncabezado: RespuestaIndividualAPregunta[] = [];


  filterOptions = [{ value: 'desc', label: 'Fecha descendente' }, { value: 'asc', label: 'Fecha ascendente' }];
  selectedFilter = 'desc';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encuestasService: EncuestasService
  ) { }

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
        return this.loadIndividualResults();
      })
    ).subscribe();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // Método modificado para cargar los resultados individuales
  private loadIndividualResults() {
    if (!this.encuestaId || !this.tokenDashboard) return of(null);

    this.isLoading = true;
    this.errorMessage = null;
    this.datosResultados = null; // Limpiar datos previos
    this.preguntasEncabezado = []; // Limpiar encabezados previos

    return this.encuestasService.getEncuestaPorId(this.tokenDashboard, this.encuestaId).pipe(
      switchMap(encuestaDetalleResponse => {
        if (!encuestaDetalleResponse?.data?.token_resultados) {
          this.handleError('No se pudo obtener el token de resultados para la encuesta.');
          return of(null);
        }
        const tokenResultados = encuestaDetalleResponse.data.token_resultados;

        return this.encuestasService.getResultadosPorTokenResultados(tokenResultados).pipe(
          tap((resultadosResponse: ResultadosPorTokenResultadosResponse) => {
            if (resultadosResponse?.data) { // La estructura ahora es diferente
              this.datosResultados = resultadosResponse.data;
              if (this.datosResultados && this.datosResultados.respuestas && this.datosResultados.respuestas.length > 0) {
                this.preguntasEncabezado = this.datosResultados.respuestas[0].respuestas;
                // Aplicar ordenamiento inicial si es necesario (ej. por fecha)
                this.sortRespuestas();
              } else if (this.datosResultados && (!this.datosResultados.respuestas || this.datosResultados.respuestas.length === 0)) {
                console.log("Encuesta cargada pero sin respuestas individuales.")
              }

            } else {
              this.handleError('No se pudieron obtener los datos de resultados o el formato es incorrecto.');
            }
            this.isLoading = false;
          }),
          catchError(err => {
            this.handleError('Error al cargar los resultados detallados de la encuesta.', err);
            return of(null);
          })
        );
      }),
      catchError(err => {
        this.handleError('Error al cargar la información inicial de la encuesta (para obtener token_resultados).', err);
        return of(null);
      })
    );
  }

  sortRespuestas(): void {
    if (this.datosResultados && this.datosResultados.respuestas) {
      this.datosResultados.respuestas.sort(
        (a: ConjuntoDeRespuestas, b: ConjuntoDeRespuestas) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return this.selectedFilter === 'desc' ? dateB - dateA : dateA - dateB;
        }
      );
    }
  }

  onFilterChange(): void {
    this.sortRespuestas();
  }

  private handleError(message: string, error?: any): void {
    this.errorMessage = message;
    this.isLoading = false;
    if (error) console.error(message, error);
    else console.error(message);
  }

  private handleErrorAndNavigate(message: string, error?: any): void {
    this.handleError(message, error);
    this.router.navigate(['/dashboard']); // O a una página de error específica
  }


  getQuestionIcon(tipoApi: string | undefined): any {
    if (!tipoApi) return this.icons.ListChecks;
    switch (tipoApi) {
      case 'OPCION_MULTIPLE_SELECCION_SIMPLE': return this.icons.ListChecks;
      case 'OPCION_MULTIPLE_SELECCION_MULTIPLE': return this.icons.CheckSquare;
      case 'ABIERTA': return this.icons.TextCursorInput;
      default: return this.icons.ListChecks;
    }
  }

  // Helper para formatear la respuesta para mostrar en la celda de la tabla
  formatAnswerForCell(respuestaPregunta: RespuestaIndividualAPregunta): string {
    if (respuestaPregunta.tipo === 'ABIERTA') {
      return respuestaPregunta.texto || '-';
    } else if (respuestaPregunta.tipo === 'OPCION_MULTIPLE_SELECCION_SIMPLE' || respuestaPregunta.tipo === 'OPCION_MULTIPLE_SELECCION_MULTIPLE') {
      return respuestaPregunta.opciones && respuestaPregunta.opciones.length > 0 ? respuestaPregunta.opciones.join(', ') : '-';
    }
    return '-';
  }
}
