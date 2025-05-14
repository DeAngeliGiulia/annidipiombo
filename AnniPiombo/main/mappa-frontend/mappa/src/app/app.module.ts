import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';


import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';
import { ViewEventComponent } from './view-event/view-event.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from './chat/chat.component';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LeafletModule,
  ],
  declarations: [AppComponent, TimelineComponent, ViewEventComponent, ChatComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
