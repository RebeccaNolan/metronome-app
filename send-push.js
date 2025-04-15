const admin = require('firebase-admin');
const serviceAccount = require('./metronome-app-1490a-firebase-adminsdk-fbsvc-b060b39b94.json');

const targetDeviceToken = 'fxYHs5YE8TAgWmXX2cztaw:APA91bFplr6bnEKXxAeS5QYZdVbW3Tf5acKcHfAghq1iuuJiQ2BBWizk7HqVXIcu71jeewNHygGfJtePspZ5ZVrZ04yAhipIKTbL9nlHbfskXgTbzFqVLVA';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Hello from Firebase!',
    body: 'This is a test push notification 🎉'
  },
  token: targetDeviceToken
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.error('Error sending message:', error);
  });
