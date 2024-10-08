import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
    // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   const  serviceAccount=""
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

export default admin;
