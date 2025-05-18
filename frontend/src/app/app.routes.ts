import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateComponent } from './components/form/create/create.component';
import { ResultsComponent } from './components/form/results/results.component';
import { ResponseComponent } from './components/response/response.component';

export const routes: Routes = [
<<<<<<< HEAD
  {
    path: '',
    component: WelcomeComponent,
  },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'create', component: CreateComponent },
  { path: 'results', component: ResultsComponent },
=======
    {
        path: '',
        component: WelcomeComponent
    },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'create', component: CreateComponent },
    { path: 'results', component: ResultsComponent },
    {path:'response',component:ResponseComponent}
>>>>>>> 0d043583759f595b1745eb90b58c927eef4166fa
];
