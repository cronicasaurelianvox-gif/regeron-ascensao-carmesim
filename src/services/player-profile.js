import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from './firebase.js';

export async function createPlayerProfile({ uid, displayName, username, email, accessCodeId }) {
  const profileReference = doc(db, 'users', uid);

  await setDoc(profileReference, {
    displayName: displayName.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    role: 'player',
    status: 'active',
    gameVersion: 'V.01 Alpha',
    accessCodeId,
    createdAt: serverTimestamp()
  });
}
