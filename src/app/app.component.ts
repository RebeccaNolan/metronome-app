import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { TapTempoComponent } from './tap-tempo/tap-tempo.component';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomepageComponent, TapTempoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'music-practice-timer';

  notificationsEnabled = true;
  token: string | null = null;

  //Initialize Firebase messaging on app startup
  constructor() {
    this.initFirebaseMessaging();
  }

  //set up Firebase messaging and notification permissions
  initFirebaseMessaging() {
    const app = initializeApp(environment.firebaseConfig);
    const messaging = getMessaging(app);

    // Request permission to send notifications
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: 'BCCYiJNmemmF_jCru0UJeJgatncI641O1Scrmqdkyv_hMCuN9zlxDm_yAUBRtpd0U8a7FYt4sWN0yQNXYrzF89w'
        }).then(token => {
          console.log('FCM Token:', token);
          this.token = token;

          this.startDailyCheck();
        });
      }
    });

    //Listen for foreground notifications
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
    });
  }

  //Check every day at 6 PM to send a notification
  startDailyCheck() {
    const targetHour = 18; // 6 PM
    const targetMinute = 0;

    setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const lastSent = localStorage.getItem('lastNotifDate');
      const today = now.toDateString();

      // Check if the notification was already sent today
      if (
        this.notificationsEnabled &&
        hours === targetHour &&
        minutes === targetMinute &&
        lastSent !== today
      ) {
        this.showNotification("Time to practice!", "Open the app and keep the rhythm going 🎵");

        // Mark as sent for today
        localStorage.setItem('lastNotifDate', today);
      }
    }, 60000); // Check every minute
  }

  // Show a notification
  showNotification(title: string, body: string) {
    new Notification(title, {
      body,
      icon: 'assets/icon.png' // optional icon
    });
  }
}
