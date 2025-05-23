import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io'
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/login`,
      { username, password }
    ).pipe(
      map(response => {
        if (response.success) {
          this.loggedIn.next(true);
          this.router.navigate(['/editor']);  // Modificato per andare a /editor
        }
        return response.success;
      }),
      catchError(() => throwError(() => new Error('Credenziali non valide')))
    );
  }

  logout(): void {
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
}