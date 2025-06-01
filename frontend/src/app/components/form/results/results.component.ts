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

// Interfaces para tipar los datos
export interface ApiOpcionResultado {
  opcion: string;
  count: number;
  porcentaje: number;
}

export interface ApiPreguntaConResultados { 
  id: number;
  texto: string;
  tipo: string;
  respuestas: ApiOpcionResultado[] | string[];
}

export interface ApiEncuestaResultados {
  id: number;
  nombre: string;
  totalRespuestas: number;
  preguntas: ApiPreguntaConResultados[];
}

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

  encuestaResultados: ApiEncuestaResultados | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  filterOptions = [ { value: 'desc', label: 'Fecha descendente' }, { value: 'asc', label: 'Fecha ascendente' }];
  selectedFilter = 'desc';

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
          this.handleError("No se proporcionó un ID de encuesta en la ruta.");
          this.router.navigate(['/dashboard']);
          return of(null);
        }
        this.encuestaId = +idStr;
        if (isNaN(this.encuestaId)) {
          this.handleError("El ID de encuesta proporcionado no es válido.");
          this.router.navigate(['/dashboard']);
          return of(null);
        }

        if (!this.tokenDashboard) {
          this.handleError("No se encontró el token de autenticación del dashboard (cookie 'td').");
          this.router.navigate(['/dashboard']);
          return of(null);
        }
        return this.loadResults();
      })
    ).subscribe();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private loadResults() {
    if (!this.encuestaId || !this.tokenDashboard) return of(null);

    this.isLoading = true;
    this.errorMessage = null;

    return this.encuestasService.getEncuestaPorId(this.tokenDashboard, this.encuestaId).pipe(
      switchMap(encuestaDetalleResponse => {
        if (!encuestaDetalleResponse?.data?.token_resultados) { 
          this.handleError('No se pudo obtener el token de resultados para la encuesta.');
          return of(null);
        }
        const tokenResultados = encuestaDetalleResponse.data.token_resultados;
        const nombreEncuestaOriginal = encuestaDetalleResponse.data.nombre;

        return this.encuestasService.getResultadosPorTokenResultados(tokenResultados).pipe(
          tap(resultadosResponse => {
            if (resultadosResponse?.data?.encuesta) { 
              this.encuestaResultados = resultadosResponse.data.encuesta;
              if (this.encuestaResultados && !this.encuestaResultados.nombre && nombreEncuestaOriginal) {
                 this.encuestaResultados.nombre = nombreEncuestaOriginal;
              }
            } else {
              this.handleError('No se pudieron obtener los datos de resultados de la encuesta o el formato es incorrecto.');
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

  private handleError(message: string, error?: any): void {
    this.errorMessage = message;
    this.isLoading = false;
    if (error) console.error(message, error);
    else console.error(message);
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

  // --- TYPE GUARDS ---
  // Este type guard verifica si un item individual es ApiOpcionResultado
  isOpcionResultado(item: any): item is ApiOpcionResultado {
    return item && typeof item.opcion === 'string' && typeof item.count === 'number' && typeof item.porcentaje === 'number';
  }

  // Este type guard verifica si el array 'respuestas' es de tipo ApiOpcionResultado[]
  // Lo hacemos público para que el template pueda acceder a él.
  public asApiOpcionResultadoArray(respuestas: ApiOpcionResultado[] | string[] | undefined): ApiOpcionResultado[] | null {
    if (respuestas && Array.isArray(respuestas) && respuestas.length > 0 && this.isOpcionResultado(respuestas[0])) {
      return respuestas as ApiOpcionResultado[];
    }
    return null;
  }

  // Este type guard verifica si el array 'respuestas' es de tipo string[]
  public asStringArray(respuestas: ApiOpcionResultado[] | string[] | undefined): string[] | null {
    if (respuestas && Array.isArray(respuestas) && respuestas.length > 0 && typeof respuestas[0] === 'string') {
      return respuestas as string[];
    }
    return null;
  }
}
