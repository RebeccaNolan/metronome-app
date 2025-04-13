// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app/app.component';
import { HomepageComponent } from './app/homepage/homepage.component';
import { TapTempoComponent } from './app/tap-tempo/tap-tempo.component';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot([
          { path: '', component: HomepageComponent },
          { path: 'tap-tempo', component: TapTempoComponent }
        ]),
        AppComponent,
        HomepageComponent,
        TapTempoComponent
      ],
      
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
