import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  event = {
    title: '',
    content: '',
    date: '',
    location: '',
    coordinatex: '',
    coordinatey: '',
    tags: '',
    is_important: false
  };
  
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isUploading = false;
  selectedDate: Date | null = null;

  constructor(private authService: AuthService, private http: HttpClient) {}

  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    
    // If already in European format, return as is
    if (dateString.includes('/')) return dateString;

    // Convert from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    
    // Validate the format is DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
      throw new Error('Invalid date format. Use DD/MM/YYYY');
    }
    
    // Convert from DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(+year, +month - 1, +day);
  }

  onManualDateChange() {
    // When manual input changes, update the datepicker
    if (this.event.date) {
      const parsedDate = this.parseDate(this.event.date);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        this.selectedDate = parsedDate;
      }
    }
  }

  onDatePickerChange(event: MatDatepickerInputEvent<Date>) {
    // When datepicker changes, update the manual input
    if (event.value) {
      const day = event.value.getDate().toString().padStart(2, '0');
      const month = (event.value.getMonth() + 1).toString().padStart(2, '0');
      const year = event.value.getFullYear();
      this.event.date = `${day}/${month}/${year}`;
    }
  }

  async onSubmit(): Promise<void> {
    // Validate required fields
    if (!this.event.title || !this.event.content || !this.event.date || !this.event.location || !this.event.coordinatex || !this.event.coordinatey) {
      alert('Title, content, date, location, coordinatex, and coordinatey are required fields');
      setTimeout(() => this.errorMessage = null, 5000);
      return;
     
    }

    let backendFormattedDate;
    try {
      // Convert the date to backend format
      backendFormattedDate = this.formatDateForBackend(this.event.date);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Invalid date format';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;
    
    try {
      const formData = new FormData();
      
      // Process content and upload images
      const processedContent = await this.processContentImages(this.event.content);
      
      // Add data to formData
      formData.append('title', this.event.title);
      formData.append('content', processedContent);
      formData.append('date', backendFormattedDate); // Now in YYYY-MM-DD format
      formData.append('location', this.event.location || '');
      formData.append('coordinatex', this.event.coordinatex || '');
      formData.append('coordinatey', this.event.coordinatey || '');
      formData.append('tags', this.event.tags.split(',').map(tag => tag.trim()).join(','));
      formData.append('is_important', String(this.event.is_important));
      formData.append('created_by', '1'); // Using admin for now
      
      // Make the HTTP request
      const response = await this.http.post(
        'https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io/api/events', 
        formData
      ).toPromise();

      console.log('Event saved successfully:', response);
      this.successMessage = 'Event saved successfully!';
      setTimeout(() => this.successMessage = null, 5000);
      this.resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      this.errorMessage = 'Error saving event. Please try again.';
      if (error instanceof Error) {
        this.errorMessage += ` (${error.message})`;
      }
    } finally {
      this.isUploading = false;
    }
  }

  private async processContentImages(content: string): Promise<string> {
    if (!content) return content;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.querySelectorAll('img');
    
    for (const img of Array.from(images)) {
      const src = img.getAttribute('src');
      if (src && src.startsWith('data:image')) {
        try {
          const imageUrl = await this.uploadImageFromDataURL(src);
          img.setAttribute('src', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          img.remove();
        }
      }
    }
    
    return doc.body.innerHTML;
  }

  private async uploadImageFromDataURL(dataURL: string): Promise<string> {
    const blob = this.dataURItoBlob(dataURL);
    const formData = new FormData();
    formData.append('image', blob, 'uploaded_image.png');
    
    const response = await this.http.post<any>(
      'https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io/upload-image',
      formData
    ).toPromise();
    
    if (response.success) {
      return response.imageUrl;
    } else {
      throw new Error(response.message || 'Error uploading image');
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  }

  private resetForm(): void {
    this.event = {
      title: '',
      content: '',
      date: '',
      location: '',
      coordinatex: '',
      coordinatey: '',
      tags: '',
      is_important: false
    };
    this.selectedDate = null;
  }

  logout(): void {
    this.authService.logout();
  }
}