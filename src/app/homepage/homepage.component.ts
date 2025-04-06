import { Component } from '@angular/core';
import { Howl } from 'howler';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

  timerDisplay: string = '00:00:00'; //displayed on screen
  isRunning: boolean = false; //flag to check if timer is running

  private startTime!: number;  // start time in milliseconds
  private timerInterval: any; // interval ID for the timer
  private elapsedTime: number = 0; 

// This function is called when the user clicks the button to start/stop the timer.
// It checks if the timer is already running. If it is, it stops the timer and clears the interval.
  toggleTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.timerInterval);
      this.elapsedTime += Date.now() - this.startTime;
    } else {
      this.isRunning = true;
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => {
        const total = this.elapsedTime + (Date.now() - this.startTime); 
        this.timerDisplay = this.formatTime(total);
      }, 10);  // update every 10ms
    }
  }

  // This function is called when the user clicks the button to reset the timer.
  // It clears the interval, resets the elapsed time to 0, and updates the display to 00:00:00.
  resetTimer() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.timerDisplay = '00:00:00'; 
    this.startTime
    this.elapsedTime = 0; 
  }
  //This function formats the elapsed time in milliseconds into a string of the format mm:ss:SS.
  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0'); // show two digits
    return `${minutes}:${seconds}:${milliseconds}`;
  }

  clickSound = new Howl({
    src: ['assets/click_woodblock.wav'],
    volume: 1.0
  });
  
  playClickSound() {
    this.clickSound.play();
  }
}
