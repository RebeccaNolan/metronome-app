import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { tap } from 'rxjs';
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

  constructor() {
    this.initFirebaseMessaging();
  }

  initFirebaseMessaging() {
    const app = initializeApp(environment.firebaseConfig);
    const messaging = getMessaging(app);

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: 'BCCYiJNmemmF_jCru0UJeJgatncI641O1Scrmqdkyv_hMCuN9zlxDm_yAUBRtpd0U8a7FYt4sWN0yQNXYrzF89w'
        }).then((token) => {
          console.log('FCM Token:', token);
        });
      } else {
        console.warn('Notification permission not granted');
      }
    });

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
    });
  }
}
