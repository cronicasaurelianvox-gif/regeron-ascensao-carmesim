import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { getSharedAudioElement } from '../src/audio/shared-audio.js';
import { musicPlaylist, getTrackSource } from '../src/audio/music-playlist.js';
import { createAuthScreen, togglePasswordVisibility } from '../src/ui/auth-screen.js';
import { createAdventureHub } from '../src/ui/adventure-hub.js';
import { validateEmail, validateLoginForm, validateSignupForm } from '../src/ui/validation.js';
import { handleRegister } from '../src/services/auth.js';
import { validateAccessCode } from '../src/services/access-code.js';
import { createPlayerProfile } from '../src/services/player-profile.js';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn()
}));

vi.mock('../src/services/access-code.js', () => ({
  validateAccessCode: vi.fn()
}));

vi.mock('../src/services/player-profile.js', () => ({
  createPlayerProfile: vi.fn()
}));

describe('validateEmail', () => {
  it('aceita e-mails válidos', () => {
    expect(validateEmail('duque@regeron.com')).toBe(true);
  });

  it('rejeita e-mails inválidos', () => {
    expect(validateEmail('duque@')).toBe(false);
  });
});

describe('validateLoginForm', () => {
  it('valida os campos do login', () => {
    expect(validateLoginForm('duque@regeron.com', 'senha123')).toEqual({
      valid: true,
      errors: {}
    });
  });

  it('exige usuário e senha preenchidos', () => {
    const result = validateLoginForm('', '');

    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      identifier: 'Informe seu usuário ou e-mail.',
      password: 'Informe sua senha.'
    });
  });
});

describe('togglePasswordVisibility', () => {
  it('alterna o tipo do campo para mostrar ou ocultar a senha', () => {
    const input = { type: 'password' };

    expect(togglePasswordVisibility(input, true)).toBe('text');
    expect(input.type).toBe('text');
    expect(togglePasswordVisibility(input, false)).toBe('password');
    expect(input.type).toBe('password');
  });
});

describe('handleRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida senha, código de acesso, cria autenticação e perfil do jogador', async () => {
    validateAccessCode.mockResolvedValue({ codeId: 'ALFA-2026' });
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'user-123', email: 'duque@regeron.com' }
    });
    updateProfile.mockResolvedValue(undefined);

    const result = await handleRegister({
      displayName: 'Duke',
      username: 'duque',
      email: 'duque@regeron.com',
      password: 'senha123',
      confirmPassword: 'senha123',
      accessCode: ' alfa-2026 '
    });

    expect(validateAccessCode).toHaveBeenCalledWith(' alfa-2026 ');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'duque@regeron.com',
      'senha123'
    );
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ uid: 'user-123' }), {
      displayName: 'Duke'
    });
    expect(createPlayerProfile).toHaveBeenCalledWith({
      uid: 'user-123',
      displayName: 'Duke',
      username: 'duque',
      email: 'duque@regeron.com',
      accessCodeId: 'ALFA-2026'
    });
    expect(result).toMatchObject({ uid: 'user-123' });
  });

  it('rejeita quando as senhas não conferem', async () => {
    await expect(
      handleRegister({
        displayName: 'Duke',
        username: 'duque',
        email: 'duque@regeron.com',
        password: 'senha123',
        confirmPassword: 'senha321',
        accessCode: 'ALFA-2026'
      })
    ).rejects.toThrow('As senhas não são iguais.');

    expect(validateAccessCode).not.toHaveBeenCalled();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(createPlayerProfile).not.toHaveBeenCalled();
  });
});

describe('createAuthScreen', () => {
  it('renderiza o botão de ajuste de som com ícone de volume em SVG', () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    createAuthScreen();

    const volumeButton = app.querySelector('.music-mute-toggle');
    expect(volumeButton).not.toBeNull();
    expect(volumeButton.querySelector('svg')).not.toBeNull();

    app.remove();
  });

  it('avança para a próxima faixa quando a música termina com loop desativado', () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    expect(musicPlaylist.length).toBeGreaterThan(1);

    createAuthScreen();

    const audio = getSharedAudioElement();
    audio.src = getTrackSource(musicPlaylist[0].fileName);
    audio.load = vi.fn();

    audio.dispatchEvent(new Event('play'));
    audio.dispatchEvent(new Event('pause'));
    audio.dispatchEvent(new Event('ended'));

    expect(decodeURIComponent(audio.src)).toContain(musicPlaylist[1].fileName);

    app.remove();
  });
});

describe('createAdventureHub', () => {
  it('preserva o player de trilha sonora ao entrar no reino', () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    createAuthScreen();
    const originalSoundToggle = app.querySelector('.sound-toggle');
    const originalMusicPlayerShell = app.querySelector('.music-player-shell');

    expect(originalSoundToggle).not.toBeNull();
    expect(originalMusicPlayerShell).not.toBeNull();

    createAdventureHub({
      player: { displayName: 'Kael', email: 'kael@regeron.com' },
      level: 12,
      realm: 'Reino Mortal',
      progress: 82,
      objective: 'DERROTAR LILITH'
    });

    expect(app.querySelector('.sound-toggle')).not.toBeNull();
    expect(app.querySelector('.music-player-shell')).not.toBeNull();
    expect(app.querySelector('.sound-toggle')).toBe(originalSoundToggle);
    expect(app.querySelector('.music-player-shell')).toBe(originalMusicPlayerShell);

    app.remove();
  });

  it('preserva o player de trilha sonora ao voltar para a tela de login', () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    createAuthScreen();
    const originalSoundToggle = app.querySelector('.sound-toggle');
    const originalMusicPlayerShell = app.querySelector('.music-player-shell');

    createAdventureHub({
      player: { displayName: 'Kael', email: 'kael@regeron.com' },
      level: 12,
      realm: 'Reino Mortal',
      progress: 82,
      objective: 'DERROTAR LILITH'
    });

    const hubSoundToggle = app.querySelector('.sound-toggle');
    const hubMusicPlayerShell = app.querySelector('.music-player-shell');

    createAuthScreen();

    expect(app.querySelector('.sound-toggle')).not.toBeNull();
    expect(app.querySelector('.music-player-shell')).not.toBeNull();
    expect(app.querySelector('.sound-toggle')).toBe(hubSoundToggle);
    expect(app.querySelector('.music-player-shell')).toBe(hubMusicPlayerShell);
    expect(app.querySelector('.sound-toggle')).toBe(originalSoundToggle);
    expect(app.querySelector('.music-player-shell')).toBe(originalMusicPlayerShell);

    app.remove();
  });

  it('não recarrega a trilha atual ao voltar para a tela de login com música ativa', () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    createAuthScreen();
    const loadSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'load')
      .mockImplementation(() => {});

    createAuthScreen();

    expect(loadSpy).not.toHaveBeenCalled();
    loadSpy.mockRestore();
    app.remove();
  });

  it('renderiza o hub com os blocos da referência visual e sem CardFlux na tela inicial', () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    createAdventureHub({
      player: { displayName: 'Kael', email: 'kael@regeron.com' },
      level: 12,
      realm: 'Reino Mortal',
      progress: 82,
      objective: 'DERROTAR LILITH'
    });

    expect(app.innerHTML).toContain('Re:Dungeon');
    expect(app.innerHTML).toContain('AVENTURA');
    expect(app.innerHTML).toContain('PARTIDA RÁPIDA');
    expect(app.innerHTML).toContain('PERSONAGEM');
    expect(app.innerHTML).toContain('OBJETIVOS');
    expect(app.innerHTML).toContain('SAIR');
    expect(app.innerHTML).not.toContain('CARDFLUX');
    expect(app.querySelector('.adventure-hub')).not.toBeNull();
    expect(app.querySelector('.music-player-shell')).not.toBeNull();
    expect(app.querySelector('.music-player-shell')?.classList.contains('is-minimized')).toBe(true);
    expect(app.querySelector('.hub-logout')).not.toBeNull();

    app.remove();
  });
});

describe('validateSignupForm', () => {
  it('valida cadastro quando os dados estão corretos', () => {
    expect(
      validateSignupForm({
        displayName: 'Duke',
        username: 'duque',
        email: 'duque@regeron.com',
        password: 'senha123',
        confirmPassword: 'senha123',
        accessCode: 'ALFA-2026'
      })
    ).toEqual({
      valid: true,
      errors: {}
    });
  });

  it('rejeita senha curta, confirmação divergente e código ausente', () => {
    const result = validateSignupForm({
      displayName: 'Duke',
      username: 'du',
      email: 'duque@',
      password: '123',
      confirmPassword: '1234',
      accessCode: ''
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      username: 'O usuário deve ter entre 3 e 20 caracteres.',
      email: 'Informe um e-mail válido.',
      password: 'A senha deve ter pelo menos 8 caracteres.',
      confirmPassword: 'As senhas devem coincidir.',
      accessCode: 'Informe o código de acesso.'
    });
  });
});
