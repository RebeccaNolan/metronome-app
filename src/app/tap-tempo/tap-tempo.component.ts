import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tap-tempo',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './tap-tempo.component.html',
  styleUrl: './tap-tempo.component.css'
})
export class TapTempoComponent {

  constructor(private router: Router) { }

  goBack() {
    this.router.navigate(['']); 
  }

}
