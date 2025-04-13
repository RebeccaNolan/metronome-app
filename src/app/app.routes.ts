import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { TapTempoComponent } from './tap-tempo/tap-tempo.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'tap-tempo', component: TapTempoComponent}
];
