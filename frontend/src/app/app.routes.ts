import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateComponent } from './components/form/create/create.component';
import { ResultsComponent } from './components/form/results/results.component';
import { ResponseComponent } from './components/response/response.component';


export const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'create/:id', component: CreateComponent },
    { path: 'results', component: ResultsComponent },
    {path:'response',component:ResponseComponent}
];
