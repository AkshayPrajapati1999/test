import * as admin from 'firebase-admin';

const serviceAccount =
  '././meditation-application-2956f-firebase-adminsdk-g39sd-76a6fd828b.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://meditation-application-2956f.appspot.com',
});

const fireStorage = admin.storage().bucket();
export { admin, fireStorage };
