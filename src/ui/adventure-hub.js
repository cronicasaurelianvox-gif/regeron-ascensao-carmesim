import { createAuthScreen } from './auth-screen.js';

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getDisplayName(player = {}) {
  const fromDisplayName = String(player.displayName ?? '').trim();
  const fromUsername = String(player.username ?? '').trim();
  const fromEmail = String(player.email ?? '').trim();

  if (fromDisplayName) {
    return fromDisplayName;
  }

  if (fromUsername) {
    return fromUsername;
  }

  if (fromEmail) {
    return fromEmail.split('@')[0] || 'Kael';
  }

  return 'Kael';
}

export function createAdventureHub(options = {}) {
  const app = document.querySelector('#app');

  if (!app) {
    return null;
  }

  const preservedSoundToggle = app.querySelector('.sound-toggle');
  const preservedMusicPlayer = app.querySelector('.music-player-shell');

  const player = options.player ?? {};
  const displayName = getDisplayName(player);
  const level = Number.isFinite(options.level) ? options.level : 12;
  const race = options.race || player.race || 'Humano';
  const className = options.className || player.className || player.class || 'Guardião Carmesim';
  const progress = clamp(Number(options.progress ?? 82) || 82, 0, 100);
  const formatResourceValue = (value) => {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    return new Intl.NumberFormat('pt-BR').format(safeValue);
  };
  const rokmasValue = Number(player.rokmas ?? player.rokmasCount ?? 0) || 0;
  const fragmentosValue = Number(player.fragmentos ?? player.fragmentosCount ?? 0) || 0;

  const getMenuPopupPosition = (menuButton, menuPopup) => {
    const buttonRect = menuButton.getBoundingClientRect();
    const popupWidth = menuPopup.offsetWidth || 240;
    const popupHeight = menuPopup.offsetHeight || 420;
    const gap = 14;
    const margin = 12;

    let left = buttonRect.right + gap;
    let top = buttonRect.top;

    if (left + popupWidth > window.innerWidth - margin) {
      left = buttonRect.left - popupWidth - gap;
    }

    if (left < margin) {
      left = margin;
    }

    if (top + popupHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - popupHeight - margin);
    }

    if (top < margin) {
      top = margin;
    }

    return { left, top };
  };

  const ensureMusicPlayerPresence = () => {
    const existingMusicPlayer = app.querySelector('.music-player-shell');
    if (existingMusicPlayer) {
      return;
    }

    const fallbackShell = document.createElement('div');
    fallbackShell.className = 'music-player-shell';
    fallbackShell.setAttribute('aria-live', 'polite');
    fallbackShell.innerHTML = `
      <button class="sound-toggle" type="button" aria-label="Abrir player de música" title="Abrir player de música">
        ♫
      </button>
      <div class="music-player" role="dialog" aria-label="Player de trilha sonora" aria-expanded="false">
        <div class="music-player-header">
          <span class="music-player-kicker">TRILHA SONORA</span>
          <div class="music-player-header-actions">
            <button type="button" class="music-loop-toggle" aria-label="Ativar loop" title="Ativar loop" aria-pressed="false">
              <span aria-hidden="true">↻</span>
            </button>
            <div class="music-volume-anchor">
              <button type="button" class="music-icon-button music-mute-toggle music-header-mute-toggle" aria-label="Abrir ajuste de volume" title="Abrir ajuste de volume">
                <svg class="music-volume-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
                  <path d="M3 10h4l5-4v12l-5-4H3z" fill="#f3e4c2" opacity="0.95" />
                  <path d="M14.8 9.2c1.1 0.9 1.7 2.1 1.7 3.3s-0.6 2.4-1.7 3.3" fill="none" stroke="#f3e4c2" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M17.7 6.8c2 1.5 3.3 3.4 3.3 5.7s-1.3 4.2-3.3 5.7" fill="none" stroke="#f3e4c2" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
              <div class="music-volume-popover" aria-hidden="true">
                <div class="music-volume-popover-inner">
                  <input class="music-volume-slider" type="range" min="0" max="1" step="0.01" value="0.25" aria-label="Volume" />
                  <span class="music-volume-value">25%</span>
                </div>
              </div>
            </div>
            <button type="button" class="music-icon-button music-library-toggle music-header-library-toggle" aria-label="Abrir biblioteca de músicas" title="Biblioteca" aria-expanded="false">
              <span aria-hidden="true">☰</span>
            </button>
            <button type="button" class="music-icon-button music-bg-toggle" aria-label="Permitir reprodução em segundo plano" title="Permitir reprodução em segundo plano" aria-pressed="true">
              ⤴
            </button>
            <button class="music-player-close" type="button" aria-label="Minimizar player" title="Minimizar player">−</button>
          </div>
        </div>
        <div class="music-player-body">
          <div class="music-player-track">
            <span class="music-player-status">Pausada</span>
            <strong class="music-player-track-name">Sem faixa</strong>
          </div>
        </div>
      </div>
    `;

    app.appendChild(fallbackShell);
  };

  app.innerHTML = `
    <div class="adventure-scene adventure-hub" aria-label="Central de aventura do jogador">
      <div class="adventure-page">
        <header class="hub-header">
          <div class="hub-brand" aria-label="Logo do jogo">
            <span class="hub-brand__crest" aria-hidden="true">
              <img
                class="hub-brand__crest-image"
                src="https://i.imgur.com/tflz0aQ.png"
                alt="Re:Dungeon"
                loading="lazy"
              />
            </span>
            <div class="hub-brand__text">
              <span class="hub-brand__title">Re:Dungeon</span>
            </div>
          </div>

          <div class="hub-header__actions" aria-label="Ações e recursos do jogador ${displayName}">
            <div class="hub-resources" aria-label="Recursos do jogador">
              <div class="hub-resource" aria-label="Rokmas do jogador">
                <img
                  class="hub-resource__icon"
                  src="https://i.imgur.com/S7tkY53.jpeg"
                  alt="Rokmas"
                  loading="lazy"
                />
                <span class="hub-resource__meta">
                  <span class="hub-resource__name">Rokmas</span>
                  <span class="hub-resource__value">${formatResourceValue(rokmasValue)}</span>
                </span>
              </div>

              <div class="hub-resource" aria-label="Fragmentos do jogador">
                <img
                  class="hub-resource__icon"
                  src="https://i.imgur.com/cD0xlNv.jpeg"
                  alt="Fragmentos"
                  loading="lazy"
                />
                <span class="hub-resource__meta">
                  <span class="hub-resource__name">Fragmentos</span>
                  <span class="hub-resource__value">${formatResourceValue(fragmentosValue)}</span>
                </span>
              </div>
            </div>

            <button type="button" class="hub-menu-button" aria-label="Abrir menu do jogador">MENU</button>
          </div>
        </header>

        <div class="hub-menu-popup" aria-label="Menu do jogador" hidden>
          <div class="hub-menu-popup__inner">
            <div class="hub-menu-section">
              <span class="hub-menu-section__title">PERSONAGEM</span>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">◈</span>
                <span class="hub-menu-item__label">Meus Personagens</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">▣</span>
                <span class="hub-menu-item__label">Inventário</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
            </div>

            <div class="hub-menu-section">
              <span class="hub-menu-section__title">PROGRESSÃO</span>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">◆</span>
                <span class="hub-menu-item__label">Conquistas</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">◎</span>
                <span class="hub-menu-item__label">Objetivos</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
            </div>

            <div class="hub-menu-section">
              <span class="hub-menu-section__title">MUNDO</span>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">◇</span>
                <span class="hub-menu-item__label">Mapa</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">▤</span>
                <span class="hub-menu-item__label">Crônicas</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
            </div>

            <div class="hub-menu-section">
              <span class="hub-menu-section__title">ECONOMIA</span>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">◈</span>
                <span class="hub-menu-item__label">Loja</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">◉</span>
                <span class="hub-menu-item__label">Trickster Coins</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
            </div>

            <div class="hub-menu-section">
              <span class="hub-menu-section__title">SISTEMA</span>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">⚙</span>
                <span class="hub-menu-item__label">Configurações</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
              <button type="button" class="hub-menu-item">
                <span class="hub-menu-item__icon" aria-hidden="true">?</span>
                <span class="hub-menu-item__label">Ajuda</span>
                <span class="hub-menu-item__arrow" aria-hidden="true">›</span>
              </button>
            </div>

            <button type="button" class="hub-menu-item hub-menu-item--danger hub-logout" aria-label="Sair da sessão">
              <span class="hub-menu-item__icon" aria-hidden="true">↪</span>
              <span class="hub-menu-item__label">SAIR</span>
            </button>
          </div>
        </div>

        <main class="hub-main">
          <section class="hub-main-left" aria-label="Modos de jogo">
            <article class="mode-card mode-card--featured" aria-label="Modo de campanha principal">
              <div class="mode-card__header">
                <span class="mode-icon" aria-hidden="true">✦</span>
                <div>
                  <p class="mode-name">AVENTURA</p>
                  <small>Campanha principal</small>
                </div>
              </div>

              <div class="mode-card__body">
                <p class="mode-subtitle">Ascensão Carmesim</p>

                <div class="mode-campaign-copy" aria-label="Sinopse da campanha">
                  <p class="mode-campaign-copy__description">
                    Uma ameaça esquecida volta a lançar sua sombra sobre o mundo. Antigos presságios começam a se cumprir,
                    verdades deixam de ser confiáveis e doze destinos são colocados em movimento.
                  </p>
                  <p class="mode-campaign-copy__highlight">
                    Encontre seus aliados, desafie o impossível e sobreviva à mentira.
                  </p>
                  <blockquote class="mode-campaign-copy__quote">
                    “Quando a verdade morrer, em que você escolherá acreditar?”
                  </blockquote>
                </div>

                <div class="mode-progress-row">
                  <span>Progresso da campanha</span>
                  <strong>74%</strong>
                </div>
                <div class="xp-bar" aria-label="Progresso da campanha">
                  <span style="width: 74%"></span>
                </div>
              </div>

              <button type="button" class="hub-action-button">CONTINUAR AVENTURA</button>
            </article>

            <div class="mode-grid" aria-label="Modos secundários">
              <article class="mode-card mode-card--quick" aria-label="Partida rápida">
                <div class="mode-card__header">
                  <span class="mode-icon" aria-hidden="true">⚔</span>
                  <div>
                    <p class="mode-name">PARTIDA RÁPIDA</p>
                    <small>Encontros e progressão</small>
                  </div>
                </div>

                <div class="mode-card__body">
                  <span class="mode-card__eyebrow">Recompensa</span>
                  <p class="mode-award">+250 Fragmentos</p>
                </div>

                <button type="button" class="hub-action-button hub-action-button--secondary">INICIAR PARTIDA</button>
              </article>

              <article class="mode-card mode-card--challenge" aria-label="Modo de desafio">
                <div class="mode-card__header">
                  <span class="mode-icon" aria-hidden="true">✧</span>
                  <div>
                    <p class="mode-name">DESAFIO</p>
                    <small>Prova especial</small>
                  </div>
                </div>

                <div class="mode-card__body">
                  <span class="mode-card__eyebrow">Recompensa</span>
                  <p class="mode-award">+400 Fragmentos</p>
                </div>

                <button type="button" class="hub-action-button hub-action-button--secondary">ACEITAR DESAFIO</button>
              </article>
            </div>
          </section>

          <aside class="character-card" aria-label="Resumo do personagem">
            <div class="character-card__header">
              <span class="character-card__crest" aria-hidden="true"></span>
              <span>PERSONAGEM</span>
            </div>
            <div class="character-portrait" aria-label="Retrato do personagem Kael">
              <div class="character-portrait__frame" aria-hidden="true"></div>
            </div>

            <div class="character-card__body">
              <h2>${String(displayName).toUpperCase()}</h2>
              <p class="character-meta">Nível ${level}</p>
              <div class="character-status-grid">
                <div class="character-status-item">
                  <span class="character-status-label">Raça</span>
                  <strong class="character-status-value">${race}</strong>
                </div>
                <div class="character-status-item">
                  <span class="character-status-label">Classe</span>
                  <strong class="character-status-value">${className}</strong>
                </div>
              </div>

              <div class="character-xp-row">
                <span>Experiência</span>
                <strong>${progress}%</strong>
              </div>
              <div class="xp-bar character-bar" aria-label="Experiência do personagem">
                <span style="width: ${progress}%"></span>
              </div>

              <button type="button" class="hub-action-button hub-action-button--character">VER PERSONAGEM</button>
            </div>
          </aside>

          <section class="objectives-panel" aria-label="Objetivos do jogador">
            <div class="panel-header">
              <p class="panel-kicker">OBJETIVOS</p>
            </div>

            <div class="objectives-grid">
              <article class="objective-item objective-item--primary">
                <div class="objective-item__head">
                  <span class="objective-item__emblem objective-item__emblem--primary" aria-hidden="true"></span>
                  <div class="objective-item__meta">
                    <small class="objective-item__type">Objetivo principal</small>
                    <h3>Derrotar Lilith</h3>
                  </div>
                </div>
                <div class="objective-progress">
                  <span>Progresso</span>
                  <strong>58%</strong>
                </div>
                <div class="xp-bar objective-bar" aria-label="Progresso do objetivo Derrotar Lilith">
                  <span style="width: 58%"></span>
                </div>
              </article>

              <article class="objective-item objective-item--hidden">
                <div class="objective-item__head">
                  <span class="objective-item__emblem objective-item__emblem--hidden" aria-hidden="true"></span>
                  <div class="objective-item__meta">
                    <small class="objective-item__type">Objetivo oculto</small>
                    <h3>???</h3>
                  </div>
                </div>
                <div class="objective-progress">
                  <span>Estado</span>
                  <strong>Oculto</strong>
                </div>
                <div class="xp-bar objective-bar" aria-label="Objetivo oculto ainda não revelado">
                  <span style="width: 0%"></span>
                </div>
              </article>

              <article class="objective-item objective-item--secondary">
                <div class="objective-item__head">
                  <span class="objective-item__emblem objective-item__emblem--secondary" aria-hidden="true"></span>
                  <div class="objective-item__meta">
                    <small class="objective-item__type">Objetivo secundário</small>
                    <h3>Dominar o poder Carmesim</h3>
                  </div>
                </div>
                <div class="objective-progress">
                  <span>Progresso</span>
                  <strong>2/3</strong>
                </div>
                <div class="xp-bar objective-bar" aria-label="Progresso do objetivo Dominar o poder Carmesim">
                  <span style="width: 67%"></span>
                </div>
              </article>

              <article class="objective-item objective-item--repetitive">
                <div class="objective-item__head">
                  <span class="objective-item__emblem objective-item__emblem--repetitive" aria-hidden="true"></span>
                  <div class="objective-item__meta">
                    <small class="objective-item__type">Objetivo repetitivo</small>
                    <h3>Alcançar o nível 13</h3>
                  </div>
                </div>
                <div class="objective-progress">
                  <span>Progresso</span>
                  <strong>12%</strong>
                </div>
                <div class="xp-bar objective-bar" aria-label="Progresso do objetivo Alcançar o nível 13">
                  <span style="width: 12%"></span>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;

  const menuButton = app.querySelector('.hub-menu-button');
  const menuPopup = app.querySelector('.hub-menu-popup');
  const logoutButton = app.querySelector('.hub-logout');

  const closeMenuPopup = () => {
    menuPopup?.classList.remove('is-open');
    menuPopup?.setAttribute('hidden', 'hidden');
  };

  const openMenuPopup = () => {
    if (!menuButton || !menuPopup) {
      return;
    }

    const { left, top } = getMenuPopupPosition(menuButton, menuPopup);
    menuPopup.style.position = 'fixed';
    menuPopup.style.left = `${left}px`;
    menuPopup.style.top = `${top}px`;
    menuPopup.hidden = false;
    menuPopup.classList.add('is-open');
    menuPopup.removeAttribute('hidden');
  };

  menuButton?.addEventListener('click', (event) => {
    event.stopPropagation();

    if (menuPopup?.classList.contains('is-open')) {
      closeMenuPopup();
      return;
    }

    openMenuPopup();
  });

  menuPopup?.querySelectorAll('.hub-menu-item').forEach((item) => {
    item.addEventListener('click', () => {
      closeMenuPopup();
    });
  });

  logoutButton?.addEventListener('click', () => {
    closeMenuPopup();
    createAuthScreen();
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target || typeof target !== 'object' || typeof target.closest !== 'function') {
      return;
    }

    if (!menuPopup || !menuButton) {
      return;
    }

    const clickedInsideMenu = menuPopup.contains(target) || menuButton.contains(target);
    if (!clickedInsideMenu) {
      closeMenuPopup();
    }
  });

  window.addEventListener('resize', () => {
    if (menuPopup?.classList.contains('is-open')) {
      openMenuPopup();
    }
  });

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

  ensureMusicPlayerPresence();

  const finalMusicPlayerShell = app.querySelector('.music-player-shell') || preservedMusicPlayer;
  const finalSoundToggle = app.querySelector('.sound-toggle') || preservedSoundToggle;

  finalMusicPlayerShell?.classList.add('is-minimized');
  finalMusicPlayerShell?.setAttribute('aria-hidden', 'true');
  if (finalMusicPlayerShell?.querySelector('.music-player')) {
    finalMusicPlayerShell.querySelector('.music-player').hidden = true;
    finalMusicPlayerShell.querySelector('.music-player').setAttribute('aria-expanded', 'false');
  }

  finalSoundToggle?.setAttribute('aria-label', 'Abrir player de música');

  return app;
}
