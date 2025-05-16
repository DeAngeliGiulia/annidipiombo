import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = {
      username: this.loginForm.value.username.trim(),
      password: this.loginForm.value.password.trim()
    };

    this.authService.login(credentials.username, credentials.password)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Accesso riuscito!';
          setTimeout(() => {
            this.router.navigate(['/editor']); // Reindirizzamento a editor.component.html
          }, 1500);
        },
        error: (err) => {
          this.errorMessage = this.getErrorMessage(err);
          console.error('Login error:', err);
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error.message?.includes('CORS')) {
      return 'Problema di connessione con il server';
    } else if (error.status === 401) {
      return 'Credenziali non valide';
    } else if (error.status === 0) {
      return 'Impossibile connettersi al server';
    }
    return error.error?.message || error.message || 'Errore durante il login';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}