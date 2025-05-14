import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io/events';
  private cachedEvents: any[] = [];

  constructor(private http: HttpClient) {}

  fetchEvents(): Observable<any[]> {
    if (this.cachedEvents.length > 0) {
      return of(this.cachedEvents);
    } else {
      return this.http.get<any[]>(this.apiUrl).pipe(
        map(events => {
          this.cachedEvents = events;
          return events;
        }),
        catchError(err => {
          console.error('Errore nel fetch degli eventi:', err);
          return of([]);
        })
      );
    }
  }

  getEventById(id: number): Observable<any | undefined> {
    if (this.cachedEvents.length > 0) {
      return of(this.cachedEvents.find(e => e.id === id));
    } else {
      return this.fetchEvents().pipe(
        map(events => events.find(e => e.id === id))
      );
    }
  }
}
