import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { EditorComponent } from './editor/editor.component'; 
import { AuthGuard } from '../app/shared/auth.guard';
import { ViewEventComponent } from './view-event/view-event.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'editor', 
    component: EditorComponent,
    canActivate: [AuthGuard] // Proteggi la rotta
  },
  { path: 'view-events', component: ViewEventComponent }, // Nuova rotta
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }