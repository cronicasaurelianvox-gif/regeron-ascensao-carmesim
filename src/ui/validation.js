export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function validateLoginForm(identifier, password) {
  const errors = {};

  if (!String(identifier || '').trim()) {
    errors.identifier = 'Informe seu usuário ou e-mail.';
  }

  if (!String(password || '').trim()) {
    errors.password = 'Informe sua senha.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateSignupForm(form) {
  const errors = {};

  if (!String(form.displayName || '').trim()) {
    errors.displayName = 'O nome do jogador é obrigatório.';
  }

  const username = String(form.username || '').trim();
  if (username.length < 3 || username.length > 20) {
    errors.username = 'O usuário deve ter entre 3 e 20 caracteres.';
  }

  if (!validateEmail(form.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  const password = String(form.password || '');
  if (password.length < 8) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.';
  }

  if (!String(form.confirmPassword || '').trim()) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (password !== String(form.confirmPassword || '')) {
    errors.confirmPassword = 'As senhas devem coincidir.';
  }

  const code = String(form.accessCode || '').trim();
  if (!code) {
    errors.accessCode = 'Informe o código de acesso.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
