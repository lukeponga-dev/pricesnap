import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: (admin as any).credential.applicationDefault(),
    projectId: "snapvalue-4607a"
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore("ai-studio-pricesnap-3d04ccf3-1cb1-4e21-a371-6c8bea97ebe8");

export { adminAuth, adminDb };
