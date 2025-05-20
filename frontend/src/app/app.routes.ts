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
  { path: 'response', component: ResponseComponent },
=======
    {
        path: '',
        component: WelcomeComponent
    },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'create/:id', component: CreateComponent },
    { path: 'results', component: ResultsComponent },
    {path:'response',component:ResponseComponent}
>>>>>>> a5e486e9a6f6f4df65709a4091b453677e3d4994
];
