import { Component } from '@angular/core';
import { Howl } from 'howler';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-homepage',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

  //timer variables
  timerDisplay: string = '00:00:00'; 
  isRunning: boolean = false; //flag to check if timer is running
  private startTime!: number; 
  private timerInterval: any; // interval ID for the timer
  private elapsedTime: number = 0; 

  //metronome variables
  bpm: number = 120;
  metronomeSubscription!: Subscription; //subscription for metronome interval
  currentBeat: number = 0; 
  isMetronomePlaying: boolean = false; //flag to check if metronome is playing

  //menu and time signature variables
  timeSignature: string = '4/4'; // Default time signature
  menuOpen: boolean = false; 

  //notification toggle
  notificationsEnabled = true;

  //audio setup
  strongClickSound = new Howl({src: ['assets/click_louder.wav'], volume: 1.0});
  clickSound = new Howl({src: ['assets/click_woodblock.wav'], volume: 1.0});

  constructor(private router: Router) { 
    //retrieve the BPM from the navigation state if available
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['tappedBPM']) {
      this.bpm = state['tappedBPM'];
    }
  }
  
  // called when the component is initialized
  ngOnInit(): void {
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    // this.initFirebaseMessaging();

    if (this.notificationsEnabled) {
      this.tryToSendDailyReminder();
    }
  }

  // called when the component is destroyed to clean up the metronome subscription
  ngOnDestroy(): void {
    if (this.metronomeSubscription) {
      this.metronomeSubscription.unsubscribe();
      this.isMetronomePlaying = false;
    }
  }

  // timer controls
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

  resetTimer() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.timerDisplay = '00:00:00'; 
    this.startTime = 0; 
    this.elapsedTime = 0; 
  }

  //This function formats the elapsed time in milliseconds into a string of the format mm:ss:SS
  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0'); // show two digits
    return `${minutes}:${seconds}:${milliseconds}`;
  }

  //metronome controls
  // starts the metronome at the current BPM and plays a strong click sound on the first beat of each measure
  startMetronome() {
    const intervalMs = 60000 / this.bpm;
    this.currentBeat = 0;
  
    this.metronomeSubscription = interval(intervalMs).subscribe(() => {
      if (this.currentBeat === 0) {
        this.playStrongClickSound();
      } else {
        this.playClickSound();
      }
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    });
  }
  
  // toggles the metronome on and off
  toggleMetronome() {
    if (this.isMetronomePlaying) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
    this.isMetronomePlaying = !this.isMetronomePlaying;
  }

  // called when the metronome is stopped to clean up the subscription
  stopMetronome() {
    if (this.metronomeSubscription) {
      this.metronomeSubscription.unsubscribe();
    }
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

  // called when the BPM is tapped to set it manually
  restartMetronomeIfPlaying() {
    if (this.isMetronomePlaying) {
      this.stopMetronome();
      this.startMetronome();
    }
  } 

  // returns the number of beats per measure based on the time signature
  get beatsPerMeasure(): number {
    return parseInt(this.timeSignature.split('/')[0], 10); 
  }
  //metronome controls
  playClickSound() {
    this.clickSound.play();
  }

  playStrongClickSound() {
    this.strongClickSound.play();
  }

  // called when the user selects a time signature from the menu
  setTimeSignature(signature: string) {
    this.timeSignature = signature;
    this.menuOpen = false; // Close the menu after selecting an option
  }

  //menu controls
  // toggles the menu open and closed
  toggleMenu() {
    this.menuOpen = !this.menuOpen; 
  }

  //notification controls
  toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    localStorage.setItem('notificationsEnabled', String(this.notificationsEnabled));
  }

  // checks if the user has already received a notification today
  tryToSendDailyReminder(): void {
    const lastSent = localStorage.getItem('lastNotificationDate');
    const today = new Date().toDateString();

    if (lastSent !== today) {
      this.sendLocalReminderNotification();
      localStorage.setItem('lastNotificationDate', today);
    }
  }

  // sends a local notification using the service worker
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
  
  //Firebase messaging setup
  initFirebaseMessaging(): void {
    const app = initializeApp(environment.firebaseConfig);
    const messaging = getMessaging(app);

    //promise to request permission for notifications
    Notification.requestPermission().then(permission => {
      // Check if the user granted permission
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
}
