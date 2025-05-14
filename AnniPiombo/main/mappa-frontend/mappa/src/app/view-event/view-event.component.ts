import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EventService } from '../services/event.service'; // Se stai usando un servizio per caricare gli eventi

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.css']
})
export class ViewEventComponent implements OnChanges {
  @Input() eventId: number | null = null;

  event: any;
  errorMessage: string | null = null;

  constructor(private sanitizer: DomSanitizer, private eventService: EventService) {}

  ngOnChanges(): void {
    if (this.eventId !== null) {
      this.eventService.getEventById(this.eventId).subscribe(eventData => {
        if (eventData) {
          this.event = {
            ...eventData,
            tags: Array.isArray(eventData.tags) ? eventData.tags.join(', ') : eventData.tags,
            sanitizedContent: eventData.content
              ? this.sanitizeContent(eventData.content)
              : 'Nessun contenuto disponibile'
          };
        }
      });
    }
  }

  sanitizeContent(content: string): SafeHtml {
    const backendUrl = 'https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io';
    const updatedContent = content.replace(/src="\/static\/uploads\//g, `src="${backendUrl}/static/uploads/`);
    return this.sanitizer.bypassSecurityTrustHtml(updatedContent);
  }
}
