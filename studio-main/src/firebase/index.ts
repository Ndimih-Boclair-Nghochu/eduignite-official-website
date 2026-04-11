
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Prefer the explicit config object on Vercel/Railway style deploys where
      // Firebase App Hosting auto-initialization is not available.
      const hasExplicitConfig = Boolean(
        firebaseConfig?.apiKey &&
        firebaseConfig?.projectId &&
        firebaseConfig?.appId
      );

      firebaseApp = hasExplicitConfig
        ? initializeApp(firebaseConfig)
        : initializeApp();
    } catch (e) {
      console.warn('Firebase initialization fallback applied.', e);
      firebaseApp = initializeApp(firebaseConfig);
    }

    const auth = getAuth(firebaseApp);

    // Enable multi-tab persistent cache using the Firebase v11+ API.
    // persistentLocalCache / persistentMultipleTabManager replace the removed
    // enableMultiTabIndexedDbPersistence() call. Falls back to in-memory on
    // the server where IndexedDB is unavailable.
    const firestore =
      typeof window !== 'undefined'
        ? initializeFirestore(firebaseApp, {
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
          })
        : getFirestore(firebaseApp);

    return { firebaseApp, auth, firestore };
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
