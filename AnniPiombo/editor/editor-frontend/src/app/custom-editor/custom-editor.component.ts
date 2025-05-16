import { Component, ElementRef, forwardRef, ViewChild, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrls: ['./custom-editor.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomEditorComponent),
      multi: true
    }
  ]
})
export class CustomEditorComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @ViewChild('editableContent', { static: true }) editableContent!: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  content: string = '';
  textColor: string = '#000000';
  backgroundColor: string = '#ffffff';
  isSourceView: boolean = false;
  private lastSavedContent: string = '';
  activeFormats: Set<string> = new Set(); // Track active formats
  activeTool: string | null = null; // Track the currently active tool

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.setupImagePasteHandler();
  }

  ngAfterViewInit() {
    this.makeContentEditable();
    this.editableContent.nativeElement.addEventListener('blur', () => {
      this.onTouch();
    });
  }

  makeContentEditable() {
    this.renderer.setAttribute(this.editableContent.nativeElement, 'contenteditable', 'true');
    this.renderer.setStyle(this.editableContent.nativeElement, 'min-height', '300px');
    this.renderer.setStyle(this.editableContent.nativeElement, 'padding', '10px');
  }

  writeValue(value: string): void {
    this.content = value || '';
    this.lastSavedContent = this.content;
    if (this.editableContent) {
      this.editableContent.nativeElement.innerHTML = this.content;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  tipotesto(event: Event): void {
    const testo = (event.target as HTMLSelectElement).value;
    this.formatText('formatBlock', testo);
  }
  formatText(command: string, value?: any): void {
    const isActive = this.activeFormats.has(command); // Check if the command is already active
    document.execCommand(command, false, value);

    // Toggle the active tool state
    if (isActive) {
      this.activeFormats.delete(command);
    } else {
      this.activeFormats.add(command);
    }

    this.activeTool = isActive ? null : command; // Set or reset the active tool
    this.saveContentIfChanged();
    this.focusEditor();
  }

  applyFormat(format: string): void {
    this.formatText(format);
  }

  updateActiveFormats(): void {
    // Ensure no tool is active initially
    this.activeFormats.clear();
  }

  isActiveFormat(format: string): boolean {
    return this.activeFormats.has(format);
  }

  isActiveTool(tool: string): boolean {
    return this.activeFormats.has(tool);
  }

  resetActiveTool(): void {
    this.activeTool = null; // Reset the active tool when the action is complete
  }

  setTextColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.textColor = color;
    this.formatText('foreColor', color);
  }

  setBackgroundColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.backgroundColor = color;
    this.formatText('hiliteColor', color);
  }

  saveContentIfChanged(): void {
    const currentContent = this.editableContent.nativeElement.innerHTML;
    if (currentContent !== this.lastSavedContent) {
      this.content = currentContent;
      this.lastSavedContent = currentContent;
      this.onChange(currentContent);
    }
  }

  private focusEditor(): void {
    this.editableContent.nativeElement.focus();
  }

  changeFontFamily(event: Event): void {
    const font = (event.target as HTMLSelectElement).value;
    this.formatText('fontName', font);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      this.formatText('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    this.formatText('insertText', text);
  }

  onImageSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.processImageFiles(files);
    }
    (event.target as HTMLInputElement).value = '';
  }

  private processImageFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = `<img src="${e.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 15px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border: 1px solid #ddd;">`;
          this.formatText('insertHTML', img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processImageFiles(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  setAlignment(alignment: string): void {
    this.formatText('justifyLeft');
    if (alignment !== 'left') {
      this.formatText(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
    }
  }

  insertLink(): void {
    const url = prompt('Inserisci URL:', 'https://');
    if (url) {
      const text = prompt('Inserisci testo del link (opzionale):', '');
      if (text !== null) {
        const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>`;
        this.formatText('insertHTML', link);
      }
    }
  }

  insertTable(): void {
    const rows = parseInt(prompt('Numero di righe:', '3') || '3');
    const cols = parseInt(prompt('Numero di colonne:', '3') || '3');
    
    if (rows > 0 && cols > 0) {
      let table = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      for (let i = 0; i < rows; i++) {
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
          table += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
        }
        table += '</tr>';
      }
      table += '</table>';
      this.formatText('insertHTML', table);
    }
  }

  insertImage(): void {
    this.imageInput.nativeElement.click();
  }

  toggleSourceView(): void {
    this.isSourceView = !this.isSourceView;
    if (this.isSourceView) {
      const content = this.editableContent.nativeElement.innerHTML;
      this.editableContent.nativeElement.textContent = content;
    } else {
      const content = this.editableContent.nativeElement.textContent || '';
      this.editableContent.nativeElement.innerHTML = content;
    }
    this.focusEditor();
  }

  private async saveImageToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io/upload-image', {
        method: 'POST',
        body: formData
      });
  
      const data = await response.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      } else {
        throw new Error('Errore nel salvataggio dell\'immagine');
      }
    } catch (error) {
      console.error('Errore:', error);
      throw error;
    }
  }

  private setupImagePasteHandler(): void {
    this.editableContent.nativeElement.addEventListener('paste', (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = `<img src="${e.target?.result}" style="max-width: 100%; height: auto; margin: 10px 0;">`;
                this.formatText('insertHTML', img);
              };
              reader.readAsDataURL(file);
            }
            break;
          }
        }
      }
    });
  }
}