// src/app/models/event.model.ts

export interface Event {
    id: number;
    title: string;
    details:string;
    date: string;  // Puoi usarlo come stringa, oppure Date se preferisci
    location: string;
    latitude: number;  // Aggiungi questi campi se il tuo evento ha coordinate geografiche
    longitude: number;
    year?: number;      // Puoi aggiungere il campo anno se è utile
  }
  