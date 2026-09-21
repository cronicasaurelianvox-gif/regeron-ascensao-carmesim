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
  const realm = options.realm || 'Reino Mortal';
  const progress = clamp(Number(options.progress ?? 82) || 82, 0, 100);

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
            <button type="button" class="music-icon-button music-mute-toggle" aria-label="Abrir ajuste de volume" title="Abrir ajuste de volume">
              <svg class="music-volume-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
                <path d="M3 10h4l5-4v12l-5-4H3z" fill="#f3e4c2" opacity="0.95" />
                <path d="M14.8 9.2c1.1 0.9 1.7 2.1 1.7 3.3s-0.6 2.4-1.7 3.3" fill="none" stroke="#f3e4c2" stroke-width="1.5" stroke-linecap="round" />
                <path d="M17.7 6.8c2 1.5 3.3 3.4 3.3 5.7s-1.3 4.2-3.3 5.7" fill="none" stroke="#f3e4c2" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
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
            <span class="hub-brand__crest" aria-hidden="true">✦</span>
            <div class="hub-brand__text">
              <span class="hub-brand__title">Re:Dungeon</span>
            </div>
          </div>

          <div class="hub-user" aria-label="Identidade do jogador">
            <div class="hub-avatar" aria-hidden="true">${displayName.charAt(0).toUpperCase() || 'K'}</div>
            <div class="hub-user__meta">
              <strong>${displayName === 'Kael' ? 'DivinoBagre' : displayName}</strong>
              <span>Nv. ${level}</span>
            </div>
          </div>

          <div class="hub-header__actions">
            <button type="button" class="hub-menu-button" aria-label="Abrir menu do jogador">MENU</button>
            <button type="button" class="hub-logout" aria-label="Sair da sessão">SAIR</button>
          </div>
        </header>

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
                  <p class="mode-award">+250 Fragmentos</p>
                </div>

                <button type="button" class="hub-action-button hub-action-button--secondary">INICIAR PARTIDA</button>
              </article>

              <article class="mode-card mode-card--challenge is-disabled" aria-label="Modo de desafio">
                <div class="mode-card__header">
                  <span class="mode-icon" aria-hidden="true">✧</span>
                  <div>
                    <p class="mode-name">DESAFIO</p>
                    <small>Prova especial</small>
                  </div>
                </div>

                <div class="mode-card__body">
                  <div class="mode-status">EM DESENVOLVIMENTO</div>
                </div>

                <button type="button" class="hub-action-button hub-action-button--muted" disabled>PRÓXIMO DESAFIO</button>
              </article>
            </div>
          </section>

          <aside class="character-card" aria-label="Resumo do personagem">
            <div class="character-card__header">PERSONAGEM</div>
            <div class="character-portrait" aria-hidden="true">
              <div class="character-portrait__frame">
                <span>KAEL</span>
              </div>
            </div>

            <div class="character-card__body">
              <h2>KAEL</h2>
              <p class="character-meta">Nível ${level}</p>
              <p class="character-title">Guardião Carmesim</p>
              <p class="character-realm">${realm}</p>

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
              <article class="objective-item">
                <div class="objective-item__head">
                  <span class="objective-item__icon" aria-hidden="true">✦</span>
                  <div>
                    <h3>Derrotar Lilith</h3>
                    <small>Objetivo principal</small>
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

              <article class="objective-item">
                <div class="objective-item__head">
                  <span class="objective-item__icon" aria-hidden="true">✧</span>
                  <div>
                    <h3>Dominar o poder Carmesim</h3>
                    <small>Objetivo do personagem</small>
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

              <article class="objective-item">
                <div class="objective-item__head">
                  <span class="objective-item__icon" aria-hidden="true">◆</span>
                  <div>
                    <h3>Alcançar o nível 13</h3>
                    <small>Próximo marco</small>
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

  const logoutButton = app.querySelector('.hub-logout');
  logoutButton?.addEventListener('click', () => {
    createAuthScreen();
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
