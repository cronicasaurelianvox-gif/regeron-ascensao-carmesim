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
  const objective = options.objective || 'DERROTAR LILITH';

  const recentEvents = options.events ?? [
    '⚔ Você derrotou um Guardião',
    '◆ Você recebeu 250 Fragmentos',
    '★ Seu personagem alcançou o Nível 12',
    '⚡ Um novo acontecimento foi revelado'
  ];

  app.innerHTML = `
    <div class="adventure-scene adventure-hub" aria-label="Central de aventura do jogador">
      <div class="adventure-page">
        <header class="hub-header">
          <div class="hub-brand" aria-label="Logo do jogo">
            <span class="hub-brand__crest" aria-hidden="true">R</span>
            <div class="hub-brand__text">
              <p class="eyebrow">RE:GERON</p>
              <h1>ASCENSÃO CARMESIM</h1>
            </div>
          </div>

          <div class="hub-user" aria-label="Dados do jogador">
            <div class="hub-avatar" aria-hidden="true">${displayName.charAt(0).toUpperCase() || 'K'}</div>
            <div class="hub-user__meta">
              <strong>${displayName}</strong>
              <span>Nível ${level}</span>
            </div>
            <button type="button" class="hub-icon-button" aria-label="Configurações da conta">
              ⚙
            </button>
            <button type="button" class="hub-logout" aria-label="Sair do reino">Sair</button>
          </div>
        </header>

        <main class="hub-layout">
          <section class="hero-panel" aria-label="Resumo do personagem">
            <div class="hero-copy">
              <p class="panel-kicker">BEM-VINDO AO REINO</p>
              <h2>Seu próximo destino aguarda.</h2>
              <div class="hero-identity">
                <span class="hero-name">${displayName}</span>
                <span class="hero-level">Nível ${level}</span>
              </div>
              <div class="hero-meta">
                <span>Reino atual</span>
                <strong>${realm}</strong>
              </div>
              <div class="hero-meta">
                <span>Experiência</span>
                <strong>${progress}%</strong>
              </div>
              <div class="xp-bar" aria-label="Progresso de experiência">
                <span style="width: ${progress}%"></span>
              </div>
            </div>

            <div class="hero-figure" aria-hidden="true">
              <div class="hero-figure__silhouette">
                <span>KAEL</span>
              </div>
            </div>
          </section>

          <section class="mode-grid" aria-label="Modos de jogo">
            <article class="mode-card mode-adventure">
              <div class="mode-card__header">
                <span class="mode-icon" aria-hidden="true">⚔</span>
                <div>
                  <p class="mode-name">AVENTURA</p>
                  <small>Campanha principal</small>
                </div>
              </div>
              <p class="mode-tagline">Percorra o caminho destinado a você.</p>
              <p class="mode-description">
                Avance pela campanha, enfrente inimigos, descubra acontecimentos e aproxime-se do confronto contra Lilith.
              </p>
              <div class="mode-progress">
                <span>Progresso da campanha</span>
                <strong>74%</strong>
              </div>
              <button type="button" class="hub-action-button">CONTINUAR AVENTURA</button>
            </article>

            <article class="mode-card mode-quick">
              <div class="mode-card__header">
                <span class="mode-icon" aria-hidden="true">⚡</span>
                <div>
                  <p class="mode-name">PARTIDA RÁPIDA</p>
                  <small>Rápida e intensa</small>
                </div>
              </div>
              <p class="mode-tagline">Entre. Enfrente. Recolha. Evolua.</p>
              <p class="mode-description">
                Uma experiência rápida focada em encontros, recursos e progressão.
              </p>
              <div class="mode-progress">
                <span>Recompensas</span>
                <strong>+250 Fragmentos</strong>
              </div>
              <button type="button" class="hub-action-button secondary">INICIAR PARTIDA</button>
            </article>

            <article class="mode-card mode-challenge is-disabled">
              <div class="mode-card__header">
                <span class="mode-icon" aria-hidden="true">🏆</span>
                <div>
                  <p class="mode-name">DESAFIO</p>
                  <small>Prova de resistência</small>
                </div>
              </div>
              <p class="mode-tagline">Prove até onde consegue chegar.</p>
              <p class="mode-description">
                Enfrente condições especiais e desafios únicos.
              </p>
              <div class="mode-status">EM DESENVOLVIMENTO</div>
              <button type="button" class="hub-action-button muted" disabled>PRÓXIMO DESAFIO</button>
            </article>
          </section>

          <div class="hub-lower-grid">
            <section class="panel cardflux-panel" aria-label="Próximo CardFlux">
              <div class="panel-header">
                <p class="panel-kicker">CARDFLUX</p>
                <span>O destino é revelado carta por carta.</span>
              </div>

              <div class="cardflux-card" aria-label="Carta de CardFlux revelada parcialmente">
                <div class="cardflux-card__inner">
                  <span class="cardflux-mark">✦</span>
                  <strong>Próximo acontecimento</strong>
                  <div class="cardflux-symbol">?</div>
                  <small>???</small>
                </div>
              </div>

              <button type="button" class="hub-action-button cardflux-button">ENTRAR NO CARDFLUX</button>
            </section>

            <aside class="panel progress-panel" aria-label="Painel de progressão">
              <div class="panel-header compact">
                <p class="panel-kicker">PROGRESSÃO</p>
              </div>

              <div class="progress-grid">
                <div class="progress-tile">
                  <span>Nível</span>
                  <strong>${level}</strong>
                </div>
                <div class="progress-tile">
                  <span>Reino</span>
                  <strong>${realm}</strong>
                </div>
                <div class="progress-tile">
                  <span>Experiência</span>
                  <strong>${progress}%</strong>
                </div>
                <div class="progress-tile">
                  <span>Recursos</span>
                  <strong>2.480</strong>
                </div>
                <div class="progress-tile">
                  <span>Vitórias</span>
                  <strong>37</strong>
                </div>
                <div class="progress-tile">
                  <span>Campanha</span>
                  <strong>74%</strong>
                </div>
              </div>
            </aside>
          </div>

          <div class="hub-lower-grid secondary-grid">
            <section class="panel objective-panel" aria-label="Objetivo atual">
              <div class="panel-header compact">
                <p class="panel-kicker">OBJETIVO ATUAL</p>
              </div>

              <h3>${objective}</h3>
              <p>Avance pelo caminho da Ascensão Carmesim e prepare-se para o confronto.</p>

              <div class="objective-progress">
                <span>PROGRESSO DA AVENTURA</span>
                <strong>58%</strong>
              </div>
              <div class="xp-bar small" aria-label="Progresso do objetivo atual">
                <span style="width: 58%"></span>
              </div>
            </section>

            <section class="panel events-panel" aria-label="Últimos acontecimentos">
              <div class="panel-header compact">
                <p class="panel-kicker">ÚLTIMOS ACONTECIMENTOS</p>
              </div>

              <ul class="event-list">
                ${recentEvents
                  .map(
                    (event) => `
                    <li>${event}</li>
                  `
                  )
                  .join('')}
              </ul>
            </section>
          </div>
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

  return app;
}
