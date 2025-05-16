import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.css']
})
export class ViewEventComponent implements OnInit {
  events: any[] = [];
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

fetchEvents(): void {
  this.http.get<any[]>('https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io/events')
    .subscribe({
      next: (data) => {
        this.events = data.map(event => ({
          ...event,
          tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags,
          sanitizedContent: event.content ? this.sanitizeContent(event.content) : 'Nessun contenuto disponibile'
        }));
      },
      error: (error) => {
        console.error('Errore nel recupero degli eventi:', error);
        this.errorMessage = 'Errore nel recupero degli eventi. Riprova più tardi.';
      }
    });
}
sanitizeContent(content: string): SafeHtml {
  const backendUrl = 'https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io';
  if (!content) {
    console.warn('Contenuto vuoto o nullo:', content);
    return '';
  }
  const updatedContent = content.replace(/src="\/static\/uploads\//g, `src="${backendUrl}/static/uploads/`);
 
  return this.sanitizer.bypassSecurityTrustHtml(updatedContent);
}
 logout(): void {
    this.authService.logout();
  }
}
