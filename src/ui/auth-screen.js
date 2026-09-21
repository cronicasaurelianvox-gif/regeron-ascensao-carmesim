import {
  clampVolume,
  filterTracksByQuery,
  formatTrackName,
  getNextTrackIndex,
  getPreviousTrackIndex,
  musicPlaylist,
  getTrackSource
} from '../audio/music-playlist.js';
import { getSharedAudioElement, bindSharedAudioListeners } from '../audio/shared-audio.js';
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

function createVolumeIcon({ muted = false } = {}) {
  const accentColor = muted ? '#d9b779' : '#f3e4c2';
  const mutedSlash = muted
    ? '<path d="M19 7L7 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />'
    : '';

  return `
    <svg
      class="music-volume-icon ${muted ? 'is-muted' : ''}"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
    >
      <path d="M3 10h4l5-4v12l-5-4H3z" fill="${accentColor}" opacity="0.95" />
      <path d="M14.8 9.2c1.1 0.9 1.7 2.1 1.7 3.3s-0.6 2.4-1.7 3.3" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M17.7 6.8c2 1.5 3.3 3.4 3.3 5.7s-1.3 4.2-3.3 5.7" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round" />
      ${mutedSlash}
    </svg>
  `;
}

export function createAuthScreen() {
  const app = document.querySelector('#app');

  if (!app) {
    return null;
  }

  const preservedSoundToggle = app.querySelector('.sound-toggle');
  const preservedMusicPlayer = app.querySelector('.music-player-shell');

  app.innerHTML = `
    <div class="auth-scene" aria-label="Tela inicial de autenticação do jogo">
      <div class="ambient ambient-left"></div>
      <div class="ambient ambient-right"></div>
      <button class="sound-toggle" type="button" aria-label="Abrir player de música" title="Abrir player de música">
        ♫
      </button>

      <div class="music-player-shell is-minimized" aria-live="polite">
        <div class="music-player" role="dialog" aria-label="Player de trilha sonora" aria-expanded="false">
          <div class="music-player-header">
            <span class="music-player-kicker">TRILHA SONORA</span>
            <div class="music-player-header-actions">
              <button
                type="button"
                class="music-loop-toggle"
                aria-label="Ativar loop"
                title="Ativar loop"
                aria-pressed="false"
              >
                <span aria-hidden="true">↻</span>
              </button>
              <div class="music-volume-anchor">
                <button
                  type="button"
                  class="music-icon-button music-mute-toggle music-header-mute-toggle"
                  aria-label="Abrir ajuste de volume"
                  title="Abrir ajuste de volume"
                >
                  ${createVolumeIcon({ muted: false })}
                </button>
                <div class="music-volume-popover" aria-hidden="true">
                  <div class="music-volume-popover-inner">
                    <input class="music-volume-slider" type="range" min="0" max="1" step="0.01" value="0.25" aria-label="Volume" />
                    <span class="music-volume-value">25%</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="music-icon-button music-library-toggle music-header-library-toggle"
                aria-label="Abrir biblioteca de músicas"
                title="Biblioteca"
                aria-expanded="false"
              >
                <span aria-hidden="true">☰</span>
              </button>
              <button
                type="button"
                class="music-icon-button music-bg-toggle"
                aria-label="Permitir reprodução em segundo plano"
                title="Permitir reprodução em segundo plano"
                aria-pressed="true"
              >
                ⤴
              </button>
              <button class="music-player-close" type="button" aria-label="Minimizar player" title="Minimizar player">
                −
              </button>
            </div>
          </div>

          <div class="music-player-body">
            <div class="music-player-track">
              <span class="music-player-status">Pausada</span>
              <strong class="music-player-track-name">Carregando...</strong>
            </div>

            <div class="music-player-progress">
              <input class="music-progress" type="range" min="0" max="100" step="0.1" value="0" aria-label="Progresso da música" />
              <div class="music-time-row">
                <span class="music-current-time">00:00</span>
                <span class="music-duration">00:00</span>
              </div>
            </div>

            <div class="music-player-controls">
              <button type="button" class="music-icon-button music-previous" aria-label="Música anterior" title="Música anterior">
                ⏮
              </button>
              <button type="button" class="music-icon-button music-play-toggle" aria-label="Reproduzir música" title="Reproduzir música">
                ▶
              </button>
              <button type="button" class="music-icon-button music-next" aria-label="Próxima música" title="Próxima música">
                ⏭
              </button>
            </div>

            <div class="music-player-volume-row">
              <div class="music-player-volume-tools"></div>
            </div>

            <div class="music-player-footer-row" aria-hidden="true">
              <label class="music-track-select-wrap" for="music-track-select">
                <span>Faixa</span>
                <select id="music-track-select" class="music-track-select" aria-label="Selecionar música"></select>
              </label>
            </div>

            <div class="music-library-panel is-collapsed">
              <div class="music-track-search-wrap" role="search">
                <span class="music-track-search-icon" aria-hidden="true">⌕</span>
                <input
                  class="music-track-search"
                  type="search"
                  placeholder="Pesquisar música..."
                  aria-label="Pesquisar música"
                />
              </div>

              <div class="music-track-list-wrapper">
                <ul class="music-track-list" aria-label="Lista de músicas"></ul>
                <p class="music-track-empty" aria-live="polite">Nenhuma trilha encontrada.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

  const generatedSoundToggle = app.querySelector('.sound-toggle');
  const generatedMusicPlayer = app.querySelector('.music-player-shell');

  if (preservedSoundToggle && preservedSoundToggle !== generatedSoundToggle) {
    generatedSoundToggle?.remove();
    app.prepend(preservedSoundToggle);
  }

  if (preservedMusicPlayer && preservedMusicPlayer !== generatedMusicPlayer) {
    generatedMusicPlayer?.remove();
    app.prepend(preservedMusicPlayer);
  }

  const soundToggle = app.querySelector('.sound-toggle') || preservedSoundToggle;
  const musicPlayerShell = app.querySelector('.music-player-shell') || preservedMusicPlayer;

  const messageBox = app.querySelector('#system-message');
  const loginSection = app.querySelector('[data-view="login"]');
  const signupSection = app.querySelector('[data-view="signup"]');
  const loginForm = app.querySelector('#login-form');
  const signupForm = app.querySelector('#signup-form');
  const musicPlayer = app.querySelector('.music-player');
  const musicPlayerClose = app.querySelector('.music-player-close');
  const musicPlayerTrackName = app.querySelector('.music-player-track-name');
  const musicPlayerStatus = app.querySelector('.music-player-status');
  const musicPlayToggle = app.querySelector('.music-play-toggle');
  const musicPreviousButton = app.querySelector('.music-previous');
  const musicNextButton = app.querySelector('.music-next');
  const musicMuteToggle = app.querySelector('.music-mute-toggle');
  const musicVolumeSlider = app.querySelector('.music-volume-slider');
  const musicVolumeValue = app.querySelector('.music-volume-value');
  const musicProgress = app.querySelector('.music-progress');
  const musicCurrentTime = app.querySelector('.music-current-time');
  const musicDuration = app.querySelector('.music-duration');
  const musicLoopToggle = app.querySelector('.music-loop-toggle');
  const musicLibraryToggle = app.querySelector('.music-library-toggle');
  const musicBgToggle = app.querySelector('.music-bg-toggle');
  const musicTrackSelect = app.querySelector('.music-track-select');
  const musicTrackSearch = app.querySelector('.music-track-search');
  const musicTrackList = app.querySelector('.music-track-list');
  const musicTrackEmpty = app.querySelector('.music-track-empty');
  const musicLibraryPanel = app.querySelector('.music-library-panel');

  const musicStorageKeys = {
    enabled: 'regeron-music-enabled',
    volume: 'regeron-music-volume',
    track: 'regeron-music-track',
    loop: 'regeron-music-loop',
    minimized: 'regeron-music-minimized',
    background: 'regeron-music-background'
  };

  const readStoredValue = (key, fallback) => {
    try {
      const storedValue = localStorage.getItem(key);

      if (storedValue === null) {
        return fallback;
      }

      return JSON.parse(storedValue);
    } catch {
      return fallback;
    }
  };

  const writeStoredValue = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignora falhas de armazenamento do navegador.
    }
  };

  const playlist = [...musicPlaylist];
  const audioElement = getSharedAudioElement();

  let soundEnabled = readStoredValue(musicStorageKeys.enabled, false);
  let activeView = 'login';
  let activeVolume = clampVolume(readStoredValue(musicStorageKeys.volume, 0.25));
  let activeTrackIndex = Number(readStoredValue(musicStorageKeys.track, 0));
  let isLoopEnabled = Boolean(readStoredValue(musicStorageKeys.loop, false));
  let isMinimized = Boolean(readStoredValue(musicStorageKeys.minimized, true));
  let continueInBackground = Boolean(readStoredValue(musicStorageKeys.background, true));
  let isLibraryOpen = false;
  let isVolumePopoverOpen = false;
  let lastVolumeBeforeMute = activeVolume > 0 ? activeVolume : 0.25;
  let trackSearchQuery = '';

  audioElement.volume = clampVolume(activeVolume);
  audioElement.loop = false;

  if (!Number.isInteger(activeTrackIndex) || activeTrackIndex < 0) {
    activeTrackIndex = 0;
  }

  if (playlist.length > 0) {
    activeTrackIndex = Math.min(activeTrackIndex, playlist.length - 1);
  }

  const normalizeAudioSource = (source) => {
    if (!source) {
      return '';
    }

    try {
      return new URL(source, window.location.href).href;
    } catch {
      return String(source);
    }
  };

  const formatTime = (value) => {
    const seconds = Number.isFinite(value) ? Math.max(0, value) : 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const updateTrackSelector = () => {
    if (!musicTrackSelect) {
      return;
    }

    musicTrackSelect.innerHTML = playlist
      .map(
        (track, index) =>
          `<option value="${index}" ${index === activeTrackIndex ? 'selected' : ''}>${formatTrackName(track.fileName)}</option>`
      )
      .join('');
  };

  const updateTrackList = () => {
    if (!musicTrackList) {
      return;
    }

    const visibleTracks = filterTracksByQuery(playlist, trackSearchQuery);

    musicTrackList.innerHTML = visibleTracks
      .map((track, index) => {
        const globalIndex = playlist.findIndex((item) => item.fileName === track.fileName);
        const resolvedIndex = globalIndex >= 0 ? globalIndex : index;
        const isCurrent = resolvedIndex === activeTrackIndex;
        const isPlaying = isCurrent && soundEnabled && !audioElement.paused;

        return `
          <li>
            <button
              type="button"
              class="music-track-item ${isCurrent ? 'is-active' : ''} ${isPlaying ? 'is-playing' : ''}"
              data-track-index="${resolvedIndex}"
              aria-label="Selecionar música ${formatTrackName(track.fileName)}"
              title="${formatTrackName(track.fileName)}"
            >
              <span>${formatTrackName(track.fileName)}</span>
            </button>
          </li>
        `;
      })
      .join('');

    if (musicTrackEmpty) {
      musicTrackEmpty.hidden = visibleTracks.length > 0;
    }
  };

  const syncLibraryState = () => {
    if (musicLibraryPanel) {
      musicLibraryPanel.classList.toggle('is-collapsed', !isLibraryOpen);
    }

    if (musicLibraryToggle) {
      musicLibraryToggle.setAttribute('aria-expanded', String(isLibraryOpen));
      musicLibraryToggle.setAttribute(
        'aria-label',
        isLibraryOpen ? 'Fechar biblioteca de músicas' : 'Abrir biblioteca de músicas'
      );
      musicLibraryToggle.title = isLibraryOpen ? 'Fechar biblioteca' : 'Biblioteca';
    }
  };

  const syncVolumePopoverState = () => {
    const volumePopover = app.querySelector('.music-volume-popover');

    if (!volumePopover) {
      return;
    }

    volumePopover.classList.toggle('is-open', isVolumePopoverOpen);
    volumePopover.setAttribute('aria-hidden', String(!isVolumePopoverOpen));
  };

  const updatePlayerState = () => {
    if (musicPlayerShell) {
      musicPlayerShell.classList.toggle('is-minimized', isMinimized);
    }

    if (musicPlayer) {
      musicPlayer.setAttribute('aria-expanded', String(!isMinimized));
      musicPlayer.hidden = isMinimized;
    }

    if (soundToggle) {
      const buttonLabel = isMinimized ? 'Abrir player de música' : 'Minimizar player de música';
      soundToggle.setAttribute('aria-label', buttonLabel);
      soundToggle.setAttribute('aria-pressed', String(!isMinimized));
      soundToggle.title = buttonLabel;
      soundToggle.textContent = soundEnabled && !audioElement.paused ? '♫' : '♪';
      soundToggle.classList.toggle('is-playing', soundEnabled && !audioElement.paused);
    }

    if (musicPlayerTrackName) {
      const currentTrack = playlist[activeTrackIndex];
      musicPlayerTrackName.textContent = currentTrack
        ? formatTrackName(currentTrack.fileName)
        : 'Sem música';
    }

    if (musicPlayerStatus) {
      musicPlayerStatus.textContent =
        soundEnabled && !audioElement.paused ? 'Reproduzindo' : 'Pausada';
    }

    if (musicPlayToggle) {
      const shouldShowPause = soundEnabled && !audioElement.paused;
      musicPlayToggle.textContent = shouldShowPause ? '❚❚' : '▶';
      musicPlayToggle.setAttribute(
        'aria-label',
        shouldShowPause ? 'Pausar música' : 'Reproduzir música'
      );
      musicPlayToggle.title = shouldShowPause ? 'Pausar música' : 'Reproduzir música';
    }

    if (musicMuteToggle) {
      const isMuted = activeVolume === 0;
      musicMuteToggle.innerHTML = createVolumeIcon({ muted: isMuted });
      musicMuteToggle.setAttribute(
        'aria-label',
        isVolumePopoverOpen ? 'Fechar ajuste de volume' : 'Abrir ajuste de volume'
      );
      musicMuteToggle.title = isVolumePopoverOpen
        ? 'Fechar ajuste de volume'
        : 'Abrir ajuste de volume';
    }

    if (musicVolumeSlider) {
      musicVolumeSlider.value = String(activeVolume);
    }

    if (musicVolumeValue) {
      musicVolumeValue.textContent = `${Math.round(activeVolume * 100)}%`;
    }

    if (musicProgress) {
      const totalDuration = Number.isFinite(audioElement.duration) ? audioElement.duration : 0;
      const currentDuration = Number.isFinite(audioElement.currentTime)
        ? audioElement.currentTime
        : 0;
      const progressValue = totalDuration > 0 ? (currentDuration / totalDuration) * 100 : 0;
      musicProgress.value = String(progressValue);
    }

    if (musicCurrentTime) {
      musicCurrentTime.textContent = formatTime(audioElement.currentTime);
    }

    if (musicDuration) {
      musicDuration.textContent = formatTime(audioElement.duration);
    }

    if (musicLoopToggle) {
      musicLoopToggle.classList.toggle('is-active', isLoopEnabled);
      musicLoopToggle.setAttribute('aria-label', isLoopEnabled ? 'Desativar loop' : 'Ativar loop');
      musicLoopToggle.setAttribute('aria-pressed', String(isLoopEnabled));
      musicLoopToggle.title = isLoopEnabled ? 'Desativar loop' : 'Ativar loop';
    }

    updateTrackSelector();
    updateTrackList();
    syncLibraryState();
    syncVolumePopoverState();
  };

  const playAudioSafely = () => {
    try {
      const playPromise = audioElement.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            updatePlayerState();
          })
          .catch(() => {
            soundEnabled = false;
            writeStoredValue(musicStorageKeys.enabled, false);
            updatePlayerState();
            setMessage('info', 'Clique no botão de som para iniciar a música.');
          });
        return;
      }

      updatePlayerState();
    } catch {
      soundEnabled = false;
      writeStoredValue(musicStorageKeys.enabled, false);
      updatePlayerState();
      setMessage('info', 'Clique no botão de som para iniciar a música.');
    }
  };

  const applyCurrentTrack = ({ autoPlay = false } = {}) => {
    if (playlist.length === 0) {
      return false;
    }

    const safeTrackIndex = Math.min(activeTrackIndex, playlist.length - 1);
    activeTrackIndex = safeTrackIndex;
    const track = playlist[safeTrackIndex];

    if (!track) {
      return false;
    }

    const nextTrackSource = getTrackSource(track.fileName);
    const currentTrackSource = normalizeAudioSource(audioElement.src);
    const targetTrackSource = normalizeAudioSource(nextTrackSource);

    if (currentTrackSource !== targetTrackSource) {
      audioElement.src = nextTrackSource;
      audioElement.load();
    }

    audioElement.volume = clampVolume(activeVolume);
    audioElement.loop = isLoopEnabled;
    writeStoredValue(musicStorageKeys.track, safeTrackIndex);
    updatePlayerState();

    if (autoPlay && soundEnabled) {
      playAudioSafely();
    }

    return true;
  };

  const pauseCurrentTrack = () => {
    audioElement.pause();
    soundEnabled = false;
    writeStoredValue(musicStorageKeys.enabled, false);
    updatePlayerState();
  };

  const playCurrentTrack = async () => {
    if (!playlist.length) {
      return;
    }

    if (!audioElement.src) {
      applyCurrentTrack({ autoPlay: true });
      return;
    }

    try {
      await audioElement.play();
      soundEnabled = true;
      writeStoredValue(musicStorageKeys.enabled, true);
      updatePlayerState();
    } catch {
      soundEnabled = false;
      writeStoredValue(musicStorageKeys.enabled, false);
      updatePlayerState();
      setMessage('info', 'Clique no botão de som para iniciar a música.');
    }
  };

  const advanceToNextTrack = ({ fromEnd = false } = {}) => {
    if (playlist.length === 0) {
      return;
    }

    if (fromEnd) {
      activeTrackIndex = 0;
    } else {
      activeTrackIndex = getNextTrackIndex(activeTrackIndex, playlist.length);
    }

    applyCurrentTrack({ autoPlay: soundEnabled });
  };

  // Vincula listeners compartilhados uma única vez via singleton
  bindSharedAudioListeners({
    loadedmetadata: () => {
      updatePlayerState();
    },
    timeupdate: () => {
      updatePlayerState();
    },
    play: () => {
      soundEnabled = true;
      writeStoredValue(musicStorageKeys.enabled, true);
      updatePlayerState();
    },
    pause: () => {
      if (audioElement.ended) {
        return;
      }

      soundEnabled = false;
      writeStoredValue(musicStorageKeys.enabled, false);
      updatePlayerState();
    },
    ended: () => {
      soundEnabled = true;
      writeStoredValue(musicStorageKeys.enabled, true);

      if (isLoopEnabled) {
        audioElement.currentTime = 0;
        try {
          const playPromise = audioElement.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              soundEnabled = false;
              writeStoredValue(musicStorageKeys.enabled, false);
              updatePlayerState();
            });
          }
        } catch {
          soundEnabled = false;
          writeStoredValue(musicStorageKeys.enabled, false);
          updatePlayerState();
        }
        return;
      }

      advanceToNextTrack();
    },
    error: () => {
      // eslint-disable-next-line no-console
      console.warn('Não foi possível carregar a música ambiente. Tentando a próxima faixa.');

      if (playlist.length > 1) {
        advanceToNextTrack();
        return;
      }

      soundEnabled = false;
      writeStoredValue(musicStorageKeys.enabled, false);
      updatePlayerState();
      setMessage('info', 'Não foi possível carregar a música ambiente.');
    }
  });

  // Pausa o áudio apenas quando a página é descarregada (navegação/fechamento).
  // Se a preferência `continueInBackground` for false, também pausa ao perder foco.
  const handlePageHidePause = () => {
    try {
      if (!audioElement.paused) {
        audioElement.pause();
        soundEnabled = false;
        writeStoredValue(musicStorageKeys.enabled, false);
        updatePlayerState();
      }
    } catch {
      // silencioso — não deve quebrar a UI
    }
  };

  const handleVisibilityChange = () => {
    try {
      if (document.hidden && !continueInBackground && !audioElement.paused) {
        audioElement.pause();
        soundEnabled = false;
        writeStoredValue(musicStorageKeys.enabled, false);
        updatePlayerState();
      }
    } catch {
      // silencioso
    }
  };

  // Pausa durante pagehide (quando a aba é descarregada)
  window.addEventListener('pagehide', handlePageHidePause);
  // Respeita a preferência do usuário ao perder foco
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (playlist.length > 0) {
    const firstTrack = playlist[activeTrackIndex];
    const currentTrackSource = firstTrack ? getTrackSource(firstTrack.fileName) : '';
    const normalizedCurrentSource = normalizeAudioSource(audioElement.src);
    const normalizedTargetSource = normalizeAudioSource(currentTrackSource);

    if (normalizedCurrentSource !== normalizedTargetSource && currentTrackSource) {
      audioElement.src = currentTrackSource;
      audioElement.load();
    }

    audioElement.volume = clampVolume(activeVolume);
    audioElement.loop = isLoopEnabled;
  }

  updatePlayerState();

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

  // Evita múltiplos bindings quando o player é preservado entre views.
  const alreadyUiBound =
    musicPlayer && musicPlayer.dataset && musicPlayer.dataset.regeronUiBound === '1';

  if (!alreadyUiBound) {
    soundToggle.addEventListener('click', async () => {
      if (!playlist.length) {
        setMessage('info', 'Não foi possível carregar a música ambiente.');
        return;
      }

      if (isMinimized) {
        isMinimized = false;
        writeStoredValue(musicStorageKeys.minimized, false);

        if (!audioElement.src) {
          applyCurrentTrack({ autoPlay: false });
        }

        updatePlayerState();
        return;
      }

      isMinimized = true;
      writeStoredValue(musicStorageKeys.minimized, true);
      updatePlayerState();
    });

    musicPlayerClose.addEventListener('click', () => {
      isMinimized = true;
      writeStoredValue(musicStorageKeys.minimized, true);
      updatePlayerState();
    });

    musicPlayToggle.addEventListener('click', async () => {
      if (!playlist.length) {
        setMessage('info', 'Não foi possível carregar a música ambiente.');
        return;
      }

      if (soundEnabled && !audioElement.paused) {
        pauseCurrentTrack();
        return;
      }

      if (!audioElement.src) {
        applyCurrentTrack({ autoPlay: true });
        return;
      }

      await playCurrentTrack();
    });

    musicPreviousButton.addEventListener('click', () => {
      if (!playlist.length) {
        return;
      }

      activeTrackIndex = getPreviousTrackIndex(activeTrackIndex, playlist.length);
      applyCurrentTrack({ autoPlay: soundEnabled });
    });

    musicNextButton.addEventListener('click', () => {
      if (!playlist.length) {
        return;
      }

      activeTrackIndex = getNextTrackIndex(activeTrackIndex, playlist.length);
      applyCurrentTrack({ autoPlay: soundEnabled });
    });

    musicMuteToggle.addEventListener('click', () => {
      isVolumePopoverOpen = !isVolumePopoverOpen;
      updatePlayerState();
    });

    app.addEventListener('click', (event) => {
      const clickedInsidePlayer = musicPlayer.contains(event.target);
      const clickedMuteButton = event.target.closest('.music-mute-toggle');
      const clickedVolumeSlider = event.target.closest('.music-volume-slider');

      if (!clickedInsidePlayer || clickedMuteButton || clickedVolumeSlider) {
        return;
      }

      if (isVolumePopoverOpen) {
        isVolumePopoverOpen = false;
        updatePlayerState();
      }
    });

    musicVolumeSlider.addEventListener('input', (event) => {
      activeVolume = clampVolume(event.target.value);
      lastVolumeBeforeMute = activeVolume > 0 ? activeVolume : lastVolumeBeforeMute;
      audioElement.volume = clampVolume(activeVolume);
      writeStoredValue(musicStorageKeys.volume, activeVolume);
      updatePlayerState();
    });

    musicProgress.addEventListener('input', (event) => {
      const totalDuration = Number.isFinite(audioElement.duration) ? audioElement.duration : 0;

      if (totalDuration <= 0) {
        return;
      }

      audioElement.currentTime = (Number(event.target.value) / 100) * totalDuration;
      updatePlayerState();
    });

    musicLoopToggle.addEventListener('click', () => {
      isLoopEnabled = !isLoopEnabled;
      audioElement.loop = isLoopEnabled;
      writeStoredValue(musicStorageKeys.loop, isLoopEnabled);
      updatePlayerState();
    });

    if (musicLibraryToggle) {
      musicLibraryToggle.addEventListener('click', () => {
        isLibraryOpen = !isLibraryOpen;
        syncLibraryState();
      });
    }

    musicTrackSelect.addEventListener('change', (event) => {
      activeTrackIndex = Number(event.target.value);
      writeStoredValue(musicStorageKeys.track, activeTrackIndex);
      applyCurrentTrack({ autoPlay: soundEnabled });
    });

    musicTrackList.addEventListener('click', (event) => {
      const trackButton = event.target.closest('[data-track-index]');

      if (!trackButton) {
        return;
      }

      activeTrackIndex = Number(trackButton.dataset.trackIndex);
      writeStoredValue(musicStorageKeys.track, activeTrackIndex);
      applyCurrentTrack({ autoPlay: soundEnabled });
    });

    if (musicTrackSearch) {
      musicTrackSearch.addEventListener('input', (event) => {
        trackSearchQuery = event.target.value.trim();
        updateTrackList();
      });
    }

    // Inicializa/atualiza visualmente o botão de reprodução em segundo plano em cada render,
    // mas liga o handler de clique apenas uma vez para evitar duplicações.
    if (musicBgToggle) {
      musicBgToggle.setAttribute('aria-pressed', String(continueInBackground));
      musicBgToggle.title = continueInBackground
        ? 'Reprodução em segundo plano: ativada'
        : 'Reprodução em segundo plano: desativada';
      musicBgToggle.classList.toggle('is-active', continueInBackground);

      if (!musicBgToggle.dataset.bgBound) {
        musicBgToggle.addEventListener('click', () => {
          continueInBackground = !continueInBackground;
          writeStoredValue(musicStorageKeys.background, continueInBackground);
          musicBgToggle.setAttribute('aria-pressed', String(continueInBackground));
          musicBgToggle.title = continueInBackground
            ? 'Reprodução em segundo plano: ativada'
            : 'Reprodução em segundo plano: desativada';
          musicBgToggle.classList.toggle('is-active', continueInBackground);
        });
        try {
          musicBgToggle.dataset.bgBound = '1';
        } catch {
          // silencioso
        }
      }
    }

    // Marca que o player já recebeu os handlers UI.
    try {
      if (musicPlayer && musicPlayer.dataset) {
        musicPlayer.dataset.regeronUiBound = '1';
      }
    } catch {
      // silencioso
    }
  }

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
