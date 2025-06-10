# 🗺️ Rutas y Navegación

La navegación se gestiona con el router de Angular.  
Las rutas principales están definidas en `src/app/app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create', component: CreateComponent },
  { path: 'create/:id', component: CreateComponent },
  { path: 'results/:id', component: ResultsComponent },
  { path: 'response/:token', component: ResponseComponent },
  { path: 'estadisticas/:id', component: EstadisticasComponent }
];
