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
 
  tapTime: number[] = []; 
  bpm: number | null = null; 
  
  constructor(private router: Router) { } 

  // navigate back to homepage and pass the BPM value
  goBack() {
    this.router.navigate([''], {
      state: { tappedBPM: this.bpm }
    });
  }

  handleTap() {
    const now = Date.now();
    this.tapTime.push(now);

    // Keep only the last two taps
    if (this.tapTime.length > 5) {
      this.tapTime.shift(); // Remove the oldest tap time if there's more than 5 taps
    }

    // Calculate the BPM if we have at least two taps
    if (this.tapTime.length >= 2) {
      const intervals = this.tapTime.slice(1).map((time, index) => time - this.tapTime[index]); // Calculate intervals between taps

      // Calculate the average interval and convert it to BPM
      const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length; 
      this.bpm = Math.round(60000 / averageInterval); 
    }
  }

  resetTapTempo() {
    this.tapTime = [];
    this.bpm = null
  }
  
}
