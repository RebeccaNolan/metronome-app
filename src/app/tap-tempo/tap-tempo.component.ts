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
    this.router.navigate([''], {
      state: { tappedBPM: this.bpm }
    });
  }

  tapTime: number[] = [];
  bpm: number | null = null;

  handleTap() {
    const now = Date.now();
    this.tapTime.push(now);

    if (this.tapTime.length > 5) {
      this.tapTime.shift(); // Keep only the last two taps
    }

    if (this.tapTime.length >= 2) {
      const intervals = this.tapTime.slice(1).map((time, index) => time - this.tapTime[index]);

      const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      this.bpm = Math.round(60000 / averageInterval); // Convert interval to BPM
    }
  }
  resetTapTempo() {
    this.tapTime = [];
    this.bpm = null
  }
  
}
