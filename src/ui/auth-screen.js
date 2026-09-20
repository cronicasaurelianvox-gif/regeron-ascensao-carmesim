import { handleRegister, loginWithIdentifier, requestPasswordReset } from '../services/auth.js';
import { createAdventureHub } from './adventure-hub.js';
import { validateEmail, validateLoginForm, validateSignupForm } from './validation.js';

export function togglePasswordVisibility(input, shouldShow) {
  if (!input) {
    return null;
  }

  input.type = shouldShow ? 'text' : 'password';
  return input.type;
}

export function createAuthScreen() {
  const app = document.querySelector('#app');

  if (!app) {
    return null;
  }

  app.innerHTML = `
    <div class="auth-scene" aria-label="Tela inicial de autenticação do jogo">
      <div class="ambient ambient-left"></div>
      <div class="ambient ambient-right"></div>
      <button class="sound-toggle" type="button" aria-label="Ativar ou desativar som">
        Som: off
      </button>

      <main class="auth-panel" aria-live="polite">
        <div class="panel-emblem" aria-hidden="true">R</div>

        <header class="auth-header">
          <p class="eyebrow">RE:GERON</p>
          <h1>
            <span class="title-main">RE:GERON</span>
            <span class="title-sub">ASCENSÃO CARMESIM</span>
            <span class="title-version">V.01 ALPHA</span>
          </h1>
        </header>

        <section class="auth-form-panel is-active" data-view="login" aria-label="Formulário de login">
          <div class="form-header">
            <h2>Entrar no reino</h2>
            <p>Retome sua jornada em Re:Geron.</p>
          </div>

          <form id="login-form" novalidate>
            <div class="field-group">
              <label for="login-identifier">E-mail</label>
              <input
                id="login-identifier"
                name="identifier"
                type="email"
                placeholder="seuemail@reino.com"
                autocomplete="email"
                aria-describedby="login-identifier-help"
              />
              <small id="login-identifier-help" class="field-hint">Informe o e-mail usado no cadastro.</small>
            </div>

            <div class="field-group">
              <label for="login-password">Senha</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Sua senha"
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="primary-button">
              Entrar no reino
            </button>
          </form>

            <div class="meta-links">
            <p>Não possui uma conta?</p>
            <button type="button" class="text-button switch-to-signup">Criar Conta</button>
            <button type="button" class="text-button info-button">Lembrar Senha</button>
          </div>
        </section>

        <section class="auth-form-panel" data-view="signup" aria-label="Formulário de cadastro" hidden>
          <div class="form-header">
            <h2>Criar novo jogador</h2>
            <p>Escolha sua identidade para iniciar a ascensão.</p>
          </div>

          <form id="signup-form" novalidate>
            <div class="field-group">
              <label for="signup-name">Nome do jogador</label>
              <input id="signup-name" name="displayName" type="text" placeholder="Seu nome completo" autocomplete="name" />
            </div>

            <div class="field-group">
              <label for="signup-username">Usuário</label>
              <input id="signup-username" name="username" type="text" placeholder="nome_de_guerreiro" autocomplete="username" />
            </div>

            <div class="field-group">
              <label for="signup-email">E-mail</label>
              <input id="signup-email" name="email" type="email" placeholder="seuemail@reino.com" autocomplete="email" />
            </div>

            <div class="field-group">
              <label for="signup-password">Senha</label>
              <div class="password-field">
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Crie uma senha forte"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  data-target="signup-password"
                  aria-label="Mostrar senha"
                  aria-pressed="false"
                  title="Mostrar senha"
                >
                  <span aria-hidden="true">👁</span>
                </button>
              </div>
            </div>

            <div class="field-group">
              <label for="signup-confirm-password">Confirmar senha</label>
              <div class="password-field">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  data-target="signup-confirm-password"
                  aria-label="Mostrar confirmação de senha"
                  aria-pressed="false"
                  title="Mostrar confirmação de senha"
                >
                  <span aria-hidden="true">👁</span>
                </button>
              </div>
            </div>

            <div class="field-group">
              <label for="signup-code">Código de acesso</label>
              <input id="signup-code" name="accessCode" type="text" placeholder="Ex.: ALFA-2026" autocomplete="off" />
            </div>

            <button type="submit" class="primary-button">Criar personagem</button>
          </form>

          <div class="meta-links">
            <p>Já possui uma conta?</p>
            <button type="button" class="text-button switch-to-login">Voltar para entrar</button>
          </div>
        </section>

        <div class="system-message" id="system-message" aria-live="polite" aria-atomic="true"></div>
      </main>

      <footer class="auth-footer">
        <p>Re:Geron — Ascensão Carmesim</p>
        <p>V.01 Alpha</p>
        <p>Um RPG de navegador em desenvolvimento.</p>
        <small>Este projeto está em fase experimental.</small>
      </footer>
    </div>
  `;

  const soundToggle = app.querySelector('.sound-toggle');
  const messageBox = app.querySelector('#system-message');
  const loginSection = app.querySelector('[data-view="login"]');
  const signupSection = app.querySelector('[data-view="signup"]');
  const loginForm = app.querySelector('#login-form');
  const signupForm = app.querySelector('#signup-form');

  let soundEnabled = false;
  let activeView = 'login';

  const accessCodeErrorMessages = {
    ACCESS_CODE_EMPTY: 'Informe o código de acesso.',
    DOCUMENT_NOT_FOUND: 'Código de acesso inválido.',
    ACTIVE_FIELD_MISSING: 'Código de acesso inválido.',
    ACTIVE_NOT_BOOLEAN: 'Código de acesso inválido.',
    ACCESS_CODE_DISABLED: 'Este código de acesso está desativado.',
    FIREBASE_PERMISSION_DENIED: 'Erro de permissão ao consultar o código de acesso.',
    FIREBASE_CONNECTION_ERROR: 'Erro de conexão ao consultar o código de acesso.'
  };

  const setMessage = (type, text) => {
    messageBox.className = `system-message ${type}`;
    messageBox.textContent = text;
  };

  const setLoadingState = (button, isLoading, label) => {
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = isLoading ? 'Aguarde...' : label;
  };

  const showView = (view) => {
    activeView = view;

    if (view === 'login') {
      loginSection.hidden = false;
      signupSection.hidden = true;
      loginSection.classList.add('is-active');
      signupSection.classList.remove('is-active');
      const field = app.querySelector('#login-identifier');
      field?.focus();
    } else {
      signupSection.hidden = false;
      loginSection.hidden = true;
      signupSection.classList.add('is-active');
      loginSection.classList.remove('is-active');
      const field = app.querySelector('#signup-name');
      field?.focus();
    }
  };

  const attachFieldValidation = (field) => {
    if (!field) return;

    field.addEventListener('input', () => {
      field.classList.remove('is-invalid');
      const message = field.parentElement?.querySelector('.field-error');
      message?.remove();
    });
  };

  app.querySelectorAll('.field-group input').forEach(attachFieldValidation);

  const attachPasswordToggle = (button) => {
    const input = app.querySelector(`#${button.dataset.target}`);

    if (!button || !input) {
      return;
    }

    button.addEventListener('click', () => {
      const shouldShow = input.type === 'password';
      const nextType = togglePasswordVisibility(input, shouldShow);

      button.setAttribute('aria-label', nextType === 'text' ? 'Ocultar senha' : 'Mostrar senha');
      button.setAttribute('aria-pressed', String(shouldShow));
      button.title = nextType === 'text' ? 'Ocultar senha' : 'Mostrar senha';
      button.innerHTML =
        nextType === 'text'
          ? '<span aria-hidden="true">🙈</span>'
          : '<span aria-hidden="true">👁</span>';
    });
  };

  app.querySelectorAll('.password-toggle').forEach(attachPasswordToggle);

  const showFieldError = (field, message) => {
    if (!field) return;

    field.classList.add('is-invalid');

    const existingError = field.parentElement?.querySelector('.field-error');
    if (existingError) {
      existingError.textContent = message;
      return;
    }

    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    field.parentElement?.appendChild(error);
  };

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = `Som: ${soundEnabled ? 'on' : 'off'}`;
    setMessage(
      'info',
      soundEnabled
        ? 'Ambiente sonoro ativado. Será conectado em uma próxima etapa.'
        : 'Ambiente sonoro pausado. Preparado para futuras trilhas.'
    );
  });

  app.querySelector('.switch-to-signup').addEventListener('click', () => {
    setMessage('info', 'A autenticação Firebase será conectada em uma próxima etapa.');
    showView('signup');
  });

  app.querySelector('.switch-to-login').addEventListener('click', () => {
    setMessage('info', 'Retornando ao acesso do reino.');
    showView('login');
  });

  app.querySelector('.info-button').addEventListener('click', () => {
    openPasswordResetModal();
  });

  function openPasswordResetModal() {
    // If modal already exists, focus the input
    let modal = app.querySelector('#password-reset-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'password-reset-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="pr-title">
          <header class="modal-header">
            <h2 id="pr-title">Recuperar acesso</h2>
            <button class="modal-close" aria-label="Fechar">✖</button>
          </header>
          <div class="modal-body">
            <p class="eyebrow">Os portões de Re:Geron ainda podem ser abertos.</p>
            <p>Informe o e-mail da sua conta. Enviaremos um link seguro para você criar uma nova senha.</p>

            <form id="password-reset-form">
              <div class="field-group">
                <label for="pr-email">E-mail da conta</label>
                <input id="pr-email" name="email" type="email" autocomplete="email" required />
              </div>

              <div class="actions">
                <button type="submit" class="primary-button">Enviar link de recuperação</button>
                <button type="button" class="text-button pr-back">Voltar para entrar</button>
              </div>
              <div id="pr-message" class="system-message" aria-live="polite"></div>
            </form>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // basic keyboard handling and focus
      const closeBtn = modal.querySelector('.modal-close');
      const backBtn = modal.querySelector('.pr-back');
      const form = modal.querySelector('#password-reset-form');
      const emailInput = modal.querySelector('#pr-email');
      const prMessage = modal.querySelector('#pr-message');

      function closeModal() {
        modal.remove();
        const field = app.querySelector('#login-identifier');
        field?.focus();
      }

      closeBtn.addEventListener('click', closeModal);
      backBtn.addEventListener('click', closeModal);

      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
      });

      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const submitBtn = form.querySelector('.primary-button');
        const email = String(emailInput.value ?? '').trim();

        prMessage.className = 'system-message info';
        prMessage.textContent = 'Enviando link de recuperação...';
        submitBtn.disabled = true;

        try {
          await requestPasswordReset(email);
          prMessage.className = 'system-message success';
          prMessage.textContent =
            'O mensageiro foi enviado. Verifique seu e-mail e a pasta de spam.';
        } catch (err) {
          prMessage.className = 'system-message error';
          const msg =
            err?.message || 'Não foi possível enviar o link de recuperação. Tente novamente.';
          // Use a safe message that doesn't confirm existence of account
          if (err?.code === 'auth/user-not-found') {
            prMessage.textContent =
              'Se existir uma conta com esse e-mail, enviaremos um link de recuperação.';
          } else {
            prMessage.textContent = msg;
          }
        } finally {
          submitBtn.disabled = false;
        }
      });

      // focus
      const input = modal.querySelector('#pr-email');
      input?.focus();
    } else {
      const input = modal.querySelector('#pr-email');
      input?.focus();
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const loginButton = loginForm.querySelector('.primary-button');
    const identifier = loginForm.identifier.value;
    const password = loginForm.password.value;
    const result = validateLoginForm(identifier, password);

    app.querySelectorAll('#login-form input').forEach((input) => {
      input.classList.remove('is-invalid');
      const error = input.parentElement?.querySelector('.field-error');
      error?.remove();
    });

    if (!result.valid) {
      const fieldMap = {
        identifier: loginForm.identifier,
        password: loginForm.password
      };

      Object.entries(result.errors).forEach(([key, message]) => {
        showFieldError(fieldMap[key], message);
      });

      setMessage('error', 'Os dados informados não são válidos.');
      return;
    }

    try {
      setLoadingState(loginButton, true, 'Entrar no reino');
      setMessage('info', 'Consultando os registros do reino...');

      const normalizedIdentifier = identifier.trim();
      const user = await loginWithIdentifier(normalizedIdentifier, password);
      const displayName = user?.displayName || normalizedIdentifier.split('@')[0] || 'Kael';
      setMessage('success', `Bem-vindo(a), ${user.email || displayName}.`);
      createAdventureHub({
        player: {
          displayName,
          username: normalizedIdentifier.split('@')[0] || 'kael',
          email: user?.email || normalizedIdentifier
        },
        level: 12,
        realm: 'Reino Mortal',
        progress: 82,
        objective: 'DERROTAR LILITH'
      });
    } catch (error) {
      if (error?.message === 'Firebase não configurado.') {
        setMessage('info', 'Firebase ainda não está conectado. A simulação local está ativa.');
        return;
      }

      if (error?.code === 'USER_NOT_FOUND') {
        setMessage('error', 'Usuário não encontrado. Verifique seu nome ou e-mail.');
      } else {
        setMessage('error', 'Não foi possível entrar no reino. Verifique seus dados.');
      }
    } finally {
      setLoadingState(loginButton, false, 'Entrar no reino');
    }
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const signupButton = signupForm.querySelector('.primary-button');
    const formData = {
      displayName: signupForm.displayName.value,
      username: signupForm.username.value,
      email: signupForm.email.value,
      password: signupForm.password.value,
      confirmPassword: signupForm.confirmPassword.value,
      accessCode: signupForm.accessCode.value
    };

    const result = validateSignupForm(formData);

    app.querySelectorAll('#signup-form input').forEach((input) => {
      input.classList.remove('is-invalid');
      const error = input.parentElement?.querySelector('.field-error');
      error?.remove();
    });

    if (!result.valid) {
      const fieldMap = {
        displayName: signupForm.displayName,
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        confirmPassword: signupForm.confirmPassword,
        accessCode: signupForm.accessCode
      };

      Object.entries(result.errors).forEach(([key, message]) => {
        showFieldError(fieldMap[key], message);
      });

      setMessage('error', 'Os dados informados não são válidos.');
      return;
    }

    try {
      setLoadingState(signupButton, true, 'Criar personagem');
      setMessage('info', 'Preparando seu registro no reino...');

      const user = await handleRegister({
        displayName: formData.displayName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        accessCode: formData.accessCode
      });

      setMessage(
        'success',
        `Seu registro foi preparado. ${user.email} está pronto para a jornada.`
      );
      signupForm.reset();
    } catch (error) {
      if (error?.message === 'Firebase não configurado.') {
        setMessage(
          'info',
          'Firebase ainda não está conectado. O cadastro foi preparado localmente para a próxima etapa.'
        );
        return;
      }

      const diagnosticMessage =
        accessCodeErrorMessages[error?.code] ??
        'Não foi possível criar o personagem no reino no momento.';
      setMessage('error', diagnosticMessage);
    } finally {
      setLoadingState(signupButton, false, 'Criar personagem');
    }
  });

  setMessage('info', 'Consultando os registros do reino...');
  showView(activeView);

  return {
    setMessage,
    showView,
    validateEmail,
    validateLoginForm,
    validateSignupForm
  };
}
