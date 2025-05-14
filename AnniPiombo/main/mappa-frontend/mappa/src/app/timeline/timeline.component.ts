import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { latLng, tileLayer, MapOptions, Map, Icon, icon, marker, LayerGroup } from 'leaflet';
import { EventService } from '../services/event.service'; // aggiorna il path se diverso

import * as L from 'leaflet';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface Evento {
  id: number;
  title: string;
  details: string;
  date: string;
  location: Location;
}

interface EventByYear {
  anno: number;
  eventi_anno: Evento[];
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit {
  eventsByYear: EventByYear[] = [];
  map: Map | undefined;
  markersLayer = new LayerGroup();
  mostraCard: boolean = false;
  eventoSelezionato: Evento | null = null;
  initialMarkersAdded: boolean = false; // Flag per controllare se i marker iniziali sono stati aggiunti

  private initialView = {
    lat: 45.4642,
    lng: 9.19,
    zoom: 11
  };

  options: MapOptions = {
    zoom: this.initialView.zoom,
    center: latLng(this.initialView.lat, this.initialView.lng),
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      })
    ]
  };

  private highlightIcon: Icon = icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(private cd: ChangeDetectorRef, private eventService: EventService) {}

  ngOnInit(): void {
    console.log("ciao");
    this.fetchEvents();
  }

  async fetchEvents(): Promise<void> {
    console.log("ciao fetchEvents");
    try {
      const response = await fetch('https://5000-dangeloluca-logineditor-yk538yv19ss.ws-eu118.gitpod.io/events');
      const data = await response.json();
      console.log("Dati ricevuti:", data);
      this.groupEventsByYear(data);
      this.cd.detectChanges();
    } catch (error) {
      console.error('Errore nel recupero degli eventi:', error);
    }
  }

  groupEventsByYear(events: any[]): void {
    const grouped: { [key: number]: Evento[] } = {};
    events.forEach((event: any) => {
      const year = new Date(event.date).getFullYear();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push({
        id: event.id,
        title: event.title,
        details: event.content,
        date: event.date,
        location: {
          lat: parseFloat(event.coordinatex),
          lng: parseFloat(event.coordinatey),
          name: event.location
        }
      });
    });

    this.eventsByYear = Object.keys(grouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(year => ({ anno: parseInt(year), eventi_anno: grouped[parseInt(year)] }));

    console.log("Eventi raggruppati per anno:", this.eventsByYear);
  }

  // Aggiungi marker sulla mappa per l'anno selezionato
  addMarkersForYear(events: Evento[]): void {
    console.log("Aggiunta marker per eventi:", events);
  
    this.markersLayer.clearLayers();
  
    events.forEach((event: Evento) => {
      const markerInstance = marker(
        [event.location.lat, event.location.lng],
        { icon: this.highlightIcon }
      )
        .bindPopup(`<b>${event.title}</b><br>${event.location.name}`)
        .on('click', () => this.onclick(event));
      
      this.markersLayer.addLayer(markerInstance);
    });
  
    if (this.map && !this.map.hasLayer(this.markersLayer)) {
      console.log("Aggiunta layer alla mappa");
      this.markersLayer.addTo(this.map);
    } else {
      console.warn("Il layer è già presente o la mappa è null");
    }
  }
  

  onMapReady(map: Map): void {
    console.log('Mappa pronta:', map);
    this.map = map;
    // Non aggiungere this.markersLayer qui all'inizio
  }

  selectEvent(yearEvent: EventByYear): void {
    if (!this.map){ 
      console.warn("Mappa non ancora inizializzata");
    return;
}
    console.log("Eventi per l'anno selezionato:", yearEvent);
    this.map.setView([this.initialView.lat, this.initialView.lng], this.initialView.zoom);
    this.addMarkersForYear(yearEvent.eventi_anno);
  }

  onclick(ev: Evento) {
    this.eventService.getEventById(ev.id).subscribe(eventData => {
      if (eventData) {
        this.eventoSelezionato = {
          ...ev,
          details: eventData.content // contenuto completo aggiornato
        };
        this.mostraCard = true;
        this.cd.detectChanges();
      } else {
        console.warn("Evento non trovato nel servizio.");
      }
    });
  }

  chiudiCard() {
    this.mostraCard = false;
    this.eventoSelezionato = null;
    setTimeout(() => {
      this.cd.detectChanges();
    });
  }
}