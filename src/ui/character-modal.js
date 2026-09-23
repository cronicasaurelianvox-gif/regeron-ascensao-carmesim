import { openHabilidadesModal } from './habilidades-modal.js';
import { openInventarioModal } from './inventario-modal.js';
import { openTalentosModal } from './talentos-modal.js';

export function openCharacterModal(player = {}, options = {}) {
  const { onSave, meta = {} } = options;

  // create draft
  const draft = JSON.parse(JSON.stringify(player || {}));

  const resolve = (keys) => {
    for (const k of keys) {
      if (k in draft && draft[k] !== undefined) return draft[k];
      if (player && k in player && player[k] !== undefined) return player[k];
      if (meta && k in meta && meta[k] !== undefined) return meta[k];
    }
    return undefined;
  };

  const imageSrc =
    resolve(['avatar', 'photoURL', 'photo', 'image', 'profilePicture', 'picture', 'img']) || '';
  const displayName = resolve(['displayName', 'name', 'username', 'user']) || '';
  const title = resolve(['title', 'subtitle']) || '';
  const raceVal = resolve(['race', 'raca']) || '';
  const classVal = resolve(['className', 'class']) || '';
  const levelVal = resolve(['level']) ?? meta.level ?? 0;
  const progressVal = resolve(['progress', 'xp', 'experience']) ?? meta.progress ?? 0;

  // prevent multiple modals
  if (document.querySelector('.character-modal-shell')) {
    return;
  }

  const shell = document.createElement('div');
  shell.className = 'character-modal-shell';
  shell.innerHTML = `
    <div class="character-modal-overlay" role="presentation"></div>
    <div class="character-modal" role="dialog" aria-label="Ficha do personagem">
      <header class="character-modal__header">
        <button class="character-modal__close" aria-label="Fechar">← VOLTAR</button>
        <h3 class="character-modal__title">PERSONAGEM</h3>
        <button class="character-modal__edit primary">EDITAR</button>
      </header>

      <div class="character-modal__body">
        <div class="character-modal__layout">
          <div class="character-panel-column">
            <section class="character-section">
              <div class="character-section__header">
                <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                <h4>ATRIBUTOS PRINCIPAIS</h4>
              </div>

              <div class="character-attributes character-attributes--primary">
                ${['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte']
                  .map((k) => {
                    const val = resolve([`attributes.${k}`, k, k.toLowerCase(), k]);
                    const display = val === undefined || val === null ? '—' : String(val);
                    const iconMap = {
                      forca: 'https://i.imgur.com/EJ3rQzW.png',
                      vitalidade: 'https://i.imgur.com/K3uuUge.png',
                      agilidade: 'https://i.imgur.com/KiLVVOi.png',
                      inteligencia: 'https://i.imgur.com/EacHWhd.png',
                      percepcao: 'https://i.imgur.com/mLz0p5Y.png',
                      sorte: 'https://i.imgur.com/BV9PtIp.png'
                    };

                    return `
                    <div class="attr-card">
                      <img class="attr-card__icon attr-card__icon--image" src="${iconMap[k] || ''}" alt="${k}" aria-hidden="true" />
                      <label class="attr-card__label">${k.toUpperCase()}</label>
                      <div class="view attr-view">${display}</div>
                      <input type="number" class="attr-input edit-field" data-key="${k}" value="${val ?? 0}" disabled style="display:none" />
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            </section>

            <section class="character-section character-section--secondary">
              <div class="character-section__header">
                <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                <h4>ATRIBUTOS SECUNDÁRIOS</h4>
              </div>

              <div class="character-attributes character-attributes--secondary">
                ${['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao']
                  .map((k) => {
                    const val = resolve([`attributes.${k}`, k, k.toLowerCase(), k]);
                    const display = val === undefined || val === null ? '—' : String(val);
                    const iconMap = {
                      prontidao: 'https://i.imgur.com/VR45Q7f.png',
                      ataque: 'https://i.imgur.com/MZbCze0.png',
                      defesa: 'https://i.imgur.com/wTjQ8cz.png',
                      reacao: 'https://i.imgur.com/ihGFnxa.png',
                      precisao: 'https://i.imgur.com/A4rp7Lh.png',
                      evasao: 'https://i.imgur.com/T9LILmW.png'
                    };

                    return `
                    <div class="attr-card attr-card--compact">
                      <img class="attr-card__icon attr-card__icon--image" src="${iconMap[k] || ''}" alt="${k}" aria-hidden="true" />
                      <label class="attr-card__label">${k.toUpperCase()}</label>
                      <div class="view attr-view">${display}</div>
                      <input type="number" class="attr-input edit-field" data-key="${k}" value="${val ?? 0}" disabled style="display:none" />
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            </section>

            <section class="character-section character-section--status">
              <div class="character-section__header">
                <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                <h4>STATUS</h4>
              </div>

              <div class="status-grid">
                ${(() => {
                  const health = resolve(['health', 'hp', 'saude', 'hpCurrent', 'currentHealth']);
                  const maxHealth = resolve(['maxHealth', 'hpMax', 'saudeMax', 'max_hp']);
                  const energy = resolve(['energy', 'stamina', 'mana', 'energyCurrent']);
                  const maxEnergy = resolve(['maxEnergy', 'staminaMax', 'manaMax', 'energyMax']);
                  const fatigue = resolve(['fatigue', 'fadiga']);
                  const maxFatigue = resolve(['maxFatigue', 'fatigueMax']);

                  const statusIcons = {
                    health: 'https://i.imgur.com/pEqVKst.png',
                    energy: 'https://i.imgur.com/DtvdKge.png',
                    fatigue: 'https://i.imgur.com/b7grtIi.png'
                  };

                  return `
                    <div class="status-card status-card--health">
                      <div class="status-card__inner">
                        <div class="status-card__icon-col">
                          <img class="status-card__icon status-card__icon--image" src="${statusIcons.health}" alt="Saúde" aria-hidden="true" />
                        </div>
                        <div class="status-card__content-col">
                          <div class="status-card__head">
                            <span class="status-card__label">SAÚDE</span>
                            <span class="status-card__value">${health ?? 0} / ${maxHealth ?? 100}</span>
                          </div>
                          <div class="status-bar-wrap">
                            <div class="status-bar status-bar--health" style="--value:${Math.min(100, Math.max(0, Number(((health ?? 0) / (maxHealth || 100)) * 100)))}%"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="status-card status-card--energy">
                      <div class="status-card__inner">
                        <div class="status-card__icon-col">
                          <img class="status-card__icon status-card__icon--image" src="${statusIcons.energy}" alt="Energia" aria-hidden="true" />
                        </div>
                        <div class="status-card__content-col">
                          <div class="status-card__head">
                            <span class="status-card__label">ENERGIA</span>
                            <span class="status-card__value">${energy ?? 0} / ${maxEnergy ?? 100}</span>
                          </div>
                          <div class="status-bar-wrap">
                            <div class="status-bar status-bar--energy" style="--value:${Math.min(100, Math.max(0, Number(((energy ?? 0) / (maxEnergy || 100)) * 100)))}%"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="status-card status-card--fatigue">
                      <div class="status-card__inner">
                        <div class="status-card__icon-col">
                          <img class="status-card__icon status-card__icon--image" src="${statusIcons.fatigue}" alt="Fadiga" aria-hidden="true" />
                        </div>
                        <div class="status-card__content-col">
                          <div class="status-card__head">
                            <span class="status-card__label">FADIGA</span>
                            <span class="status-card__value">${fatigue ?? 0} / ${maxFatigue ?? 100}</span>
                          </div>
                          <div class="status-bar-wrap">
                            <div class="status-bar status-bar--fatigue" style="--value:${Math.min(100, Math.max(0, Number(((fatigue ?? 0) / (maxFatigue || 100)) * 100)))}%"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                })()}
              </div>
            </section>

            <div class="character-lower-grid">
              <section class="character-panel">
                <div class="character-panel__header">
                  <div class="character-panel__title-wrap">
                    <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                    <h5>TALENTOS</h5>
                  </div>
                  <button class="character-panel__action" type="button">VER TODOS →</button>
                </div>
                <div class="character-panel__body">
                  ${
                    (Array.isArray(draft.talents) ? draft.talents : []).slice(0, 3).length
                      ? (Array.isArray(draft.talents) ? draft.talents : [])
                          .slice(0, 3)
                          .map(
                            (talent) => `
                    <div class="talent-item">
                      <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                      <div class="talent-item__text">
                        <strong>${talent.name || talent}</strong>
                        <span>${talent.description || ''}</span>
                      </div>
                    </div>
                  `
                          )
                          .join('')
                      : '<div class="panel-empty">Nenhum talento adquirido.</div>'
                  }
                </div>
              </section>

              <section class="character-panel">
                <div class="character-panel__header">
                  <div class="character-panel__title-wrap">
                    <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                    <h5>HABILIDADES</h5>
                  </div>
                  <button class="character-panel__action" type="button">VER TODOS →</button>
                </div>
                <div class="character-panel__body character-panel__body--abilities">
                  ${
                    (Array.isArray(draft.abilities) ? draft.abilities : []).slice(0, 4).length
                      ? (Array.isArray(draft.abilities) ? draft.abilities : [])
                          .slice(0, 4)
                          .map(
                            (ability) => `
                    <div class="ability-card">
                      <div class="ability-card__image" style="background-image:url('${ability.image || ''}')"></div>
                      <div class="ability-card__meta">
                        <strong>${ability.name || ability}</strong>
                        <span>${ability.type || 'Ataque'}</span>
                        <em>${ability.rank || '◆◆◇◇'}</em>
                      </div>
                    </div>
                  `
                          )
                          .join('')
                      : '<div class="panel-empty">Nenhuma habilidade desbloqueada.</div>'
                  }
                </div>
              </section>

              <section class="character-panel">
                <div class="character-panel__header">
                  <div class="character-panel__title-wrap">
                    <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                    <h5>INVENTÁRIO</h5>
                  </div>
                  <button class="character-panel__action" type="button">VER TODOS →</button>
                </div>
                <div class="character-panel__body">
                  ${
                    (Array.isArray(draft.inventory) ? draft.inventory : []).slice(0, 4).length
                      ? (Array.isArray(draft.inventory) ? draft.inventory : [])
                          .slice(0, 4)
                          .map(
                            (item) => `
                    <div class="inventory-item">
                      <div class="inventory-item__icon" ${item.image ? `style="background-image:url('${item.image}')"` : ''} aria-hidden="true"></div>
                      <div class="inventory-item__text">
                        <strong>${item.name || item}</strong>
                        <span>${item.type || 'Item'}</span>
                      </div>
                      ${item.count ? `<span class="inventory-item__count">x${item.count}</span>` : '<span class="inventory-item__arrow">›</span>'}
                    </div>
                  `
                          )
                          .join('')
                      : '<div class="panel-empty">Nenhum item no inventário.</div>'
                  }
                </div>
              </section>
            </div>
          </div>

          <div class="character-card-column">
            <div class="character-portrait-panel">
              <div class="character-portrait__art">
                ${imageSrc ? `<img class="character-hero__image" src="${imageSrc}" alt="Retrato do personagem" />` : `<img class="character-hero__image" src="https://i.imgur.com/QyTtgOr.jpeg" alt="Retrato do personagem" />`}
                <div class="character-portrait__shade"></div>
              </div>

              <div class="character-identity">
                <h2 class="view name-view">${String(displayName).toUpperCase()}</h2>
                <input class="field field--name edit-field" value="${(draft.displayName || displayName || '').replace(/"/g, '&quot;')}" style="display:none" />

                <p class="view title-view">${String(title)}</p>
                <input class="field field--title edit-field" value="${(draft.title || title || '').replace(/"/g, '&quot;')}" style="display:none" />

                <div class="character-identity__meta">
                  ${raceVal ? `<div class="meta-row"><span>RAÇA</span><strong class="view race-view">${String(raceVal)}</strong><input class="field field--race edit-field" value="${String(raceVal).replace(/"/g, '&quot;')}" style="display:none" /></div>` : ''}
                  ${classVal ? `<div class="meta-row"><span>CLASSE</span><strong class="view class-view">${String(classVal)}</strong><input class="field field--class edit-field" value="${String(classVal).replace(/"/g, '&quot;')}" style="display:none" /></div>` : ''}
                  ${title ? `<div class="meta-row"><span>TÍTULO</span><strong>${String(title)}</strong></div>` : ''}
                </div>
              </div>

              <div class="character-level-panel">
                <div class="character-level-badge">
                  <span>NÍVEL</span>
                  <strong class="view level-view">${Number(levelVal)}</strong>
                  <input class="field field--level edit-field" type="number" value="${Number(levelVal)}" style="display:none" />
                </div>

                <div class="character-exp">
                  <div class="character-exp__header">
                    <span>EXPERIÊNCIA</span>
                    <strong class="view progress-view">${Number(progressVal)}%</strong>
                    <input class="field field--progress edit-field" type="number" value="${Number(progressVal)}" style="display:none" />
                  </div>
                  <div class="character-exp__bar">
                    <span style="width: ${Math.min(100, Math.max(0, Number(progressVal || 0)))}%"></span>
                  </div>
                  ${Number(progressVal || 0) > 0 && Number(levelVal || 0) > 0 ? '<small>Progresso atual</small>' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="character-modal__footer">
        <button class="btn cancel">CANCELAR</button>
        <button class="btn save primary">SALVAR ALTERAÇÕES</button>
      </footer>
    </div>
  `;

  document.body.appendChild(shell);
  document.body.classList.add('character-modal-open');

  // Wire the TALENTOS -> VER TODOS button to open the Talentos modal only for the talents panel
  const talentsBtn = shell.querySelector(
    '.character-lower-grid .character-panel:first-of-type .character-panel__action'
  );
  if (talentsBtn) {
    talentsBtn.addEventListener('click', () => {
      openTalentosModal(draft, {
        onClose: () => {
          // refresh the preview list in the talents panel body (keep same preview format)
          const body = shell.querySelector(
            '.character-lower-grid .character-panel:first-of-type .character-panel__body'
          );
          if (body) {
            const talentsList = (Array.isArray(draft.talents) ? draft.talents : []).slice(0, 3);
            body.innerHTML = talentsList.length
              ? talentsList
                  .map(
                    (talent) => `
                    <div class="talent-item">
                      <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                      <div class="talent-item__text">
                        <strong>${talent.name || talent}</strong>
                        <span>${talent.description || ''}</span>
                      </div>
                    </div>
                  `
                  )
                  .join('')
              : '<div class="panel-empty">Nenhum talento adquirido.</div>';
          }
        }
      });
    });
  }

  const abilitiesBtn = shell.querySelector(
    '.character-lower-grid .character-panel:nth-of-type(2) .character-panel__action'
  );
  if (abilitiesBtn) {
    abilitiesBtn.addEventListener('click', () => {
      openHabilidadesModal(draft, {
        onClose: () => {
          // keep the preview panel untouched; the modal is only for consultation
        }
      });
    });
  }

  const inventoryBtn = shell.querySelector(
    '.character-lower-grid .character-panel:nth-of-type(3) .character-panel__action'
  );
  if (inventoryBtn) {
    inventoryBtn.addEventListener('click', () => {
      openInventarioModal(draft, {
        onClose: () => {
          // keep the preview panel untouched; the modal is only for consultation
        }
      });
    });
  }

  const overlay = shell.querySelector('.character-modal-overlay');
  const modal = shell.querySelector('.character-modal');
  const closeBtn = shell.querySelector('.character-modal__close');
  const editBtn = shell.querySelector('.character-modal__edit');
  const saveBtn = shell.querySelector('.btn.save');
  const cancelBtn = shell.querySelector('.btn.cancel');

  const attrInputs = shell.querySelectorAll('.attr-input');
  const editFields = shell.querySelectorAll('.edit-field');

  let editMode = false;

  function setEditMode(on) {
    editMode = !!on;
    // toggle visibility of view vs edit fields
    shell.querySelectorAll('.view').forEach((v) => {
      v.style.display = editMode ? 'none' : '';
    });
    editFields.forEach((e) => {
      e.style.display = editMode ? '' : 'none';
      e.disabled = !editMode;
    });
    attrInputs.forEach((a) => (a.disabled = !editMode));
    if (editMode) {
      editBtn.textContent = 'CANCELAR EDIÇÃO';
      saveBtn.style.display = '';
      cancelBtn.style.display = '';
      modal.classList.add('is-edit');
    } else {
      editBtn.textContent = 'EDITAR';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      modal.classList.remove('is-edit');
      // restore draft values to inputs
      shell.querySelector('.name-view').textContent = String(
        draft.displayName || displayName || ''
      ).toUpperCase();
      shell.querySelector('.title-view').textContent = String(draft.title || title || '');
      const raceView = shell.querySelector('.race-view');
      if (raceView) raceView.textContent = String(draft.race || raceVal || '');
      const classView = shell.querySelector('.class-view');
      if (classView) classView.textContent = String(draft.className || classVal || '');
      const levelView = shell.querySelector('.level-view');
      if (levelView) levelView.textContent = Number(draft.level || levelVal || 0);
      const progView = shell.querySelector('.progress-view');
      if (progView) progView.textContent = `${Number(draft.progress || progressVal || 0)}%`;
      attrInputs.forEach((el) => {
        const key = el.dataset.key;
        if (key) el.value = draft[key] ?? 0;
      });
      // update attr views
      const primaryKeys = [
        'forca',
        'vitalidade',
        'agilidade',
        'inteligencia',
        'percepcao',
        'sorte'
      ];
      primaryKeys.forEach((k) => {
        const view = shell
          .querySelector(`.attr-card [data-key="${k}"]`)
          ?.parentElement?.querySelector('.attr-view');
        const val = resolve([`attributes.${k}`, k, k.toLowerCase(), k]);
        if (view) view.textContent = val === undefined || val === null ? '—' : String(val);
      });
      const secondaryKeys = ['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'];
      secondaryKeys.forEach((k) => {
        const view = shell
          .querySelector(`.attr-card [data-key="${k}"]`)
          ?.parentElement?.querySelector('.attr-view');
        const val = resolve([`attributes.${k}`, k, k.toLowerCase(), k]);
        if (view) view.textContent = val === undefined || val === null ? '—' : String(val);
      });
    }
  }

  setEditMode(false);

  function closeModal() {
    document.body.classList.remove('character-modal-open');
    shell.remove();
  }

  overlay.addEventListener('click', () => closeModal());
  closeBtn.addEventListener('click', () => closeModal());

  editBtn.addEventListener('click', () => {
    setEditMode(!editMode);
  });

  cancelBtn.addEventListener('click', () => {
    setEditMode(false);
  });

  saveBtn.addEventListener('click', () => {
    // gather fields into updated object
    const updated = {};

    const nameEl = shell.querySelector('.edit-field.field--name');
    const titleEl = shell.querySelector('.edit-field.field--title');
    const raceEl = shell.querySelector('.edit-field.field--race');
    const classEl = shell.querySelector('.edit-field.field--class');
    const levelEl = shell.querySelector('.edit-field.field--level');
    const progressEl = shell.querySelector('.edit-field.field--progress');

    const name = nameEl ? nameEl.value.trim() : draft.displayName || displayName || '';
    const title = titleEl ? titleEl.value.trim() : draft.title || title || '';
    const race = raceEl ? raceEl.value.trim() : draft.race || raceVal || '';
    const className = classEl ? classEl.value.trim() : draft.className || classVal || '';
    const level = levelEl ? Number(levelEl.value) || 0 : draft.level || levelVal || 0;
    const progress = progressEl
      ? Number(progressEl.value) || 0
      : draft.progress || progressVal || 0;

    updated.displayName = name;
    updated.title = title;
    updated.race = race;
    updated.className = className;
    updated.level = level;
    updated.progress = progress;

    attrInputs.forEach((el) => {
      const key = el.dataset.key;
      if (key) updated[key] = Number(el.value) || 0;
    });

    // merge into draft
    Object.assign(draft, updated);

    // persist via callback if provided, otherwise to localStorage (draft)
    if (typeof onSave === 'function') {
      try {
        onSave(Object.assign({}, draft));
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.setItem('playerProfileDraft', JSON.stringify(draft));
      } catch {
        // ignore
      }
    }

    setEditMode(false);
    closeModal();
  });

  // keyboard ESC to close
  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }
  window.addEventListener('keydown', onKey);

  // cleanup on remove
  shell.addEventListener('DOMNodeRemoved', () => {
    if (!document.body.contains(shell)) {
      window.removeEventListener('keydown', onKey);
    }
  });

  return {
    close: closeModal
  };
}
