import { doc, getDoc } from 'firebase/firestore';

import { db } from './firebase.js';

const createDiagnosticError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export async function validateAccessCode(accessCode) {
  const normalizedCode = String(accessCode ?? '')
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    throw createDiagnosticError('ACCESS_CODE_EMPTY', 'Informe o código de acesso.');
  }

  if (!db) {
    throw createDiagnosticError(
      'FIREBASE_CONNECTION_ERROR',
      'Erro de conexão ao consultar o código de acesso.'
    );
  }

  const codeReference = doc(db, 'accessCodes', normalizedCode);

  let codeSnapshot;

  try {
    codeSnapshot = await getDoc(codeReference);
  } catch (error) {
    const message =
      error?.code === 'permission-denied' || /permission-denied/i.test(String(error?.message ?? ''))
        ? 'Erro de permissão ao consultar o código de acesso.'
        : 'Erro de conexão ao consultar o código de acesso.';

    const accessError = createDiagnosticError(
      error?.code === 'permission-denied' || /permission-denied/i.test(String(error?.message ?? ''))
        ? 'FIREBASE_PERMISSION_DENIED'
        : 'FIREBASE_CONNECTION_ERROR',
      message
    );
    accessError.cause = error;
    throw accessError;
  }

  const codeData = codeSnapshot.data();

  // Removido log de depuração para evitar exibição no console do usuário

  if (!codeSnapshot.exists()) {
    throw createDiagnosticError('DOCUMENT_NOT_FOUND', 'Código de acesso inválido.');
  }

  if (!Object.prototype.hasOwnProperty.call(codeData, 'active')) {
    throw createDiagnosticError('ACTIVE_FIELD_MISSING', 'Campo active ausente no código.');
  }

  if (typeof codeData.active !== 'boolean') {
    throw createDiagnosticError('ACTIVE_NOT_BOOLEAN', 'Campo active inválido.');
  }

  if (codeData.active !== true) {
    throw createDiagnosticError('ACCESS_CODE_DISABLED', 'Este código de acesso está desativado.');
  }

  return {
    codeId: normalizedCode,
    permanent: codeData.permanent === true
  };
}
