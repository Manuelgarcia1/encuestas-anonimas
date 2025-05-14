import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateComponent } from './components/form/create/create.component';

export const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'create', component: CreateComponent }
];