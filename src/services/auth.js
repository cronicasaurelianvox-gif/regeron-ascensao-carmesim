import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

import { collection, getDocs, query, where } from 'firebase/firestore';

import { app, db } from './firebase.js';
import { validateAccessCode } from './access-code.js';
import { createPlayerProfile } from './player-profile.js';

const auth = app ? getAuth(app) : null;

function ensureAuth() {
  if (!auth) {
    const error = new Error('Firebase não configurado.');
    error.code = 'FIREBASE_NOT_CONFIGURED';
    throw error;
  }

  return auth;
}

export async function registerPlayer({ displayName, email, password }) {
  const activeAuth = ensureAuth();
  const credential = await createUserWithEmailAndPassword(activeAuth, email, password);

  await updateProfile(credential.user, {
    displayName
  });

  return credential.user;
}

export async function handleRegister(form) {
  const isFormDataInstance = typeof FormData !== 'undefined' && form instanceof FormData;
  const formData = isFormDataInstance
    ? Object.fromEntries(form.entries())
    : {
        displayName: form?.displayName ?? form?.name ?? '',
        username: form?.username ?? '',
        email: form?.email ?? '',
        password: form?.password ?? '',
        confirmPassword: form?.confirmPassword ?? '',
        accessCode: form?.accessCode ?? form?.code ?? ''
      };

  const displayName = String(formData.displayName ?? '').trim();
  const username = String(formData.username ?? '').trim();
  const email = String(formData.email ?? '').trim();
  const password = String(formData.password ?? '');
  const confirmPassword = String(formData.confirmPassword ?? '');
  const accessCode = String(formData.accessCode ?? '');

  if (password !== confirmPassword) {
    throw new Error('As senhas não são iguais.');
  }

  const access = await validateAccessCode(accessCode);

  const user = await registerPlayer({
    displayName,
    email,
    password
  });

  await createPlayerProfile({
    uid: user.uid,
    displayName,
    username,
    email,
    accessCodeId: access.codeId
  });

  return user;
}

export async function loginPlayer(email, password) {
  const activeAuth = ensureAuth();
  const credential = await signInWithEmailAndPassword(activeAuth, email, password);

  return credential.user;
}

async function findEmailByUsername(username) {
  if (!db) return null;

  const normalized = String(username ?? '')
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', normalized));
  const snap = await getDocs(q);

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data?.email) return String(data.email).trim().toLowerCase();
  }

  return null;
}

export async function loginWithIdentifier(identifier, password) {
  const isEmail = String(identifier ?? '').includes('@');
  let email = isEmail ? String(identifier).trim() : await findEmailByUsername(identifier);

  if (!email) {
    // If no email found for username, attempt to synthesize the legacy local-domain email
    const normalized = String(identifier ?? '').trim();
    if (normalized && !isEmail) {
      email = `${normalized}@regeron.local`;
    }
  }

  if (!email) {
    const err = new Error('USER_NOT_FOUND');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  return loginPlayer(email, password);
}

export async function logoutPlayer() {
  const activeAuth = ensureAuth();
  await signOut(activeAuth);
}

export function getCurrentPlayer() {
  return auth?.currentUser ?? null;
}

export async function requestPasswordReset(email) {
  const activeAuth = ensureAuth();
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    const err = new Error('Informe um e-mail válido.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  try {
    await sendPasswordResetEmail(activeAuth, normalizedEmail);
  } catch (error) {
    const code = String(error?.code ?? error?.message ?? '').toLowerCase();

    let message = 'Não foi possível enviar o link de recuperação. Tente novamente.';

    if (code.includes('invalid-email') || code.includes('auth/invalid-email')) {
      message = 'Digite um e-mail válido.';
    } else if (code.includes('user-not-found')) {
      message = 'Não encontramos uma conta com esse e-mail.';
    } else if (code.includes('too-many-requests')) {
      message = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    } else if (code.includes('network-request-failed')) {
      message = 'Não foi possível conectar ao Firebase.';
    } else if (code.includes('operation-not-allowed')) {
      message = 'A recuperação por e-mail não está disponível no Firebase.';
    }

    const err = new Error(message);
    err.code = error?.code ?? 'unknown';
    throw err;
  }
}
