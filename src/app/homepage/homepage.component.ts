import { Component } from '@angular/core';
import { Howl } from 'howler';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-homepage',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

  timerDisplay: string = '00:00:00'; //displayed on screen
  isRunning: boolean = false; //flag to check if timer is running
  bpm: number = 120;

  metronomeInterval: any; 

  private startTime!: number;  // start time in milliseconds
  private timerInterval: any; // interval ID for the timer
  private elapsedTime: number = 0; 

  menuOpen: boolean = false; 
  timeSignature: string = '4/4'; // Default time signature

  currentBeat: number = 0; 
  get beatsPerMeasure(): number {
    return parseInt(this.timeSignature.split('/')[0], 10); 
  }

  strongClickSound = new Howl({
    src: ['assets/click_louder.wav'],
    volume: 1.0
  });
  
  playStrongClickSound() {
    this.strongClickSound.play();
  }
  

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

  isMetronomePlaying: boolean = false;

  startMetronome() {
    const interval = 60000 / this.bpm;
    this.currentBeat = 0;
  
    this.metronomeInterval = setInterval(() => {
      if (this.currentBeat === 0) {
        this.playStrongClickSound(); // First beat
      } else {
        this.playClickSound(); // Regular beat
      }
  
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }, interval);
  }
  
  toggleMetronome() {
    if (this.isMetronomePlaying) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
    this.isMetronomePlaying = !this.isMetronomePlaying;
  }

  stopMetronome() {
    clearInterval(this.metronomeInterval);
    this.currentBeat = 0;
  }

  increaseBPM() {
    this.bpm++;
    this.restartMetronomeIfPlaying();
  }
  
  decreaseBPM() {
    if (this.bpm > 20) { 
      this.bpm--;
      this.restartMetronomeIfPlaying();
    }
  }
  restartMetronomeIfPlaying() {
    if (this.isMetronomePlaying) {
      this.stopMetronome();
      this.startMetronome();
    }
  }  

  constructor(private router: Router) { 
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['tappedBPM']) {
      this.bpm = state['tappedBPM'];
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  setTimeSignature(signature: string) {
    this.timeSignature = signature;
    this.menuOpen = false; // Close the menu after selecting an option
  }

  notificationsEnabled = true;

  toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    localStorage.setItem('notificationsEnabled', String(this.notificationsEnabled));
  }

  ngOnInit(): void {
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    this.initFirebaseMessaging();

    if (this.notificationsEnabled) {
      this.tryToSendDailyReminder();
    }
  }

  initFirebaseMessaging(): void {
    const app = initializeApp(environment.firebaseConfig);
    const messaging = getMessaging(app);

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: 'BCCYiJNmemmF_jCru0UJeJgatncI641O1Scrmqdkyv_hMCuN9zlxDm_yAUBRtpd0U8a7FYt4sWN0yQNXYrzF89w' // Replace this!
        }).then(token => {
          console.log('FCM Token:', token);
        });
      } else {
        console.warn('Notification permission not granted');
      }
    });
  }

  tryToSendDailyReminder(): void {
    const lastSent = localStorage.getItem('lastNotificationDate');
    const today = new Date().toDateString();

    if (lastSent !== today) {
      this.sendLocalReminderNotification();
      localStorage.setItem('lastNotificationDate', today);
    }
  }

  sendLocalReminderNotification(): void {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.showNotification('🎵 Practice Time!', {
            body: 'Don’t forget to practice today!',
            icon: 'assets/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'daily-reminder',
          } as any); 
        }
      });
    }
  }
}
