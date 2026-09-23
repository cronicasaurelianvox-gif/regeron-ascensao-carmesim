export function openTalentosModal(player = {}, options = {}) {
  const { onClose } = options || {};

  // prevent duplicate
  if (document.querySelector('.talentos-modal-shell')) return;

  const draft = JSON.parse(JSON.stringify(player || {}));

  const shell = document.createElement('div');
  shell.className = 'talentos-modal-shell';
  shell.innerHTML = `
    <div class="talentos-modal-overlay" role="presentation"></div>
    <div class="talentos-modal" role="dialog" aria-label="Talentos do personagem">
      <header class="talentos-modal__header">
        <div class="talentos-modal__heading">
          <div class="talentos-modal__title-wrap">
            <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
            <h3 class="talentos-modal__title">TALENTOS</h3>
          </div>
          <p class="talentos-modal__subtitle">Gerencie e equipe os talentos do seu personagem.</p>
        </div>
        <button class="talentos-modal__close" aria-label="Fechar">✕</button>
      </header>

      <div class="talentos-modal__body">
        <section class="talentos-equipped">
          <div class="talentos-section__header">
            <div class="talentos-section__title-wrap">
              <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
              <h4>TALENTOS EQUIPADOS</h4>
            </div>
            <div class="talentos-count">0 / 0</div>
          </div>
          <div class="talentos-equipped__grid"></div>
        </section>

        <div class="talentos-separator" aria-hidden="true"></div>

        <section class="talentos-catalog">
          <div class="talentos-section__header talents-header--catalog">
            <div class="talentos-section__title-wrap">
              <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
              <h4>TODOS OS TALENTOS</h4>
            </div>
            <div class="talentos-actions">
              <label class="talentos-search-wrap" aria-label="Pesquisar talentos">
                <span class="talentos-search__icon">⌕</span>
                <input class="talentos-search" placeholder="Pesquisar talentos..." />
              </label>
              <select class="talentos-filter" aria-label="Filtrar talentos">
                <option value="all">Todos</option>
                <option value="equipped">Equipados</option>
                <option value="available">Disponíveis</option>
              </select>
            </div>
          </div>

          <div class="talentos-catalog__grid"></div>
        </section>
      </div>

    </div>
  `;

  document.body.appendChild(shell);
  document.body.classList.add('talentos-modal-open');

  const overlay = shell.querySelector('.talentos-modal-overlay');
  const closeBtn = shell.querySelector('.talentos-modal__close');
  const search = shell.querySelector('.talentos-search');
  const filter = shell.querySelector('.talentos-filter');
  const catalogGrid = shell.querySelector('.talentos-catalog__grid');
  const equippedGrid = shell.querySelector('.talentos-equipped__grid');
  const countEl = shell.querySelector('.talentos-count');

  const maxSlots =
    Number(
      draft.maxTalents ?? draft.talentSlots ?? draft.maxTalentSlots ?? draft.slotsTalentos ?? 4
    ) || 4;

  function close() {
    shell.remove();
    document.body.classList.remove('talentos-modal-open');
    if (typeof onClose === 'function') onClose();
  }

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Data source: try to reuse player.talents or a global catalog if available
  const owned = Array.isArray(draft.talents) ? draft.talents.slice() : [];
  const globalCatalog = (window && window.TALENT_CATALOG) || [];
  const catalog = globalCatalog.length ? globalCatalog.slice() : owned.slice();

  function getEffectiveCatalog() {
    const q = (search.value || '').toLowerCase().trim();
    const filterValue = filter.value || 'all';

    return catalog.filter((t) => {
      const name = (t.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const matchesQuery = !q || name.includes(q) || desc.includes(q);

      const has = owned.find((o) => (o.id && t.id && o.id === t.id) || o === t);
      const equipped = !!(has && has.equipped);
      const locked = !!t.locked;

      const matchesFilter =
        filterValue === 'all' ||
        (filterValue === 'equipped' && equipped) ||
        (filterValue === 'available' && !locked && !equipped);

      return matchesQuery && matchesFilter;
    });
  }

  function renderCatalog() {
    const list = getEffectiveCatalog();
    catalogGrid.innerHTML = list.length
      ? list
          .map((t) => {
            const name = t.name || t;
            const desc = t.description || 'Talento do personagem.';
            const has = owned.find((o) => (o.id && t.id && o.id === t.id) || o === t);
            const equipped = !!(has && has.equipped);
            const locked = !!t.locked;
            return `
              <article class="talent-card ${equipped ? 'is-equipped' : ''} ${locked ? 'is-locked' : ''}" data-id="${t.id || ''}">
                <img class="diamond-icon talent-card__icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
                <div class="talent-card__meta">
                  <strong>${name}</strong>
                  <span>${desc}</span>
                </div>
                <div class="talent-card__actions">
                  ${locked ? '<button type="button" class="talent-card__btn is-locked-state" disabled>🔒 BLOQUEADO</button>' : equipped ? '<button type="button" class="talent-card__btn is-equipped-state">✓ EQUIPADO</button>' : '<button type="button" class="talent-card__btn equip">EQUIPAR</button>'}
                </div>
              </article>
            `;
          })
          .join('')
      : '<div class="talent-empty"><img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" /><span>NENHUM TALENTO DISPONÍVEL</span></div>';

    catalogGrid.querySelectorAll('.talent-card__btn.equip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.talent-card');
        const id = card?.dataset?.id || '';
        const item = catalog.find(
          (t) =>
            (t.id && id && t.id === id) ||
            (!t.id && !id && (t.name || t) === card?.querySelector('strong')?.textContent)
        ) || { id, name: card?.querySelector('strong')?.textContent || 'Talento' };
        const existing = owned.find(
          (o) =>
            (o.id && item.id && o.id === item.id) ||
            (!o.id && !item.id && (o.name || o) === (item.name || item))
        );
        if (existing) {
          existing.equipped = true;
        } else {
          item.equipped = true;
          owned.push(item);
        }
        renderEquipped();
        renderCatalog();
      });
    });

    catalogGrid.querySelectorAll('.talent-card__btn.is-equipped-state').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.talent-card');
        const id = card?.dataset?.id || '';
        const item = owned.find(
          (o) =>
            (o.id && id && o.id === id) ||
            (!o.id && !id && (o.name || o) === (card?.querySelector('strong')?.textContent || ''))
        );
        if (item) item.equipped = false;
        renderEquipped();
        renderCatalog();
      });
    });
  }

  function renderEquipped() {
    const equipped = owned.filter((t) => t.equipped);
    const slots = Array.from({ length: maxSlots }, (_, index) => {
      const talent = equipped[index];
      if (talent) {
        return `
          <div class="talent-slot is-filled">
            <img class="diamond-icon talent-slot__icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
            <div class="talent-slot__name">${talent.name || 'Talento'}</div>
            <div class="talent-slot__desc">${talent.description || ''}</div>
            <div class="talent-slot__state">✓ EQUIPADO</div>
          </div>
        `;
      }

      return `
        <div class="talent-slot is-empty">
          <img class="diamond-icon talent-slot__plus" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
          <strong>SLOT VAZIO</strong>
          <small>Equipe um talento</small>
        </div>
      `;
    }).join('');

    equippedGrid.innerHTML = slots;
    countEl.textContent = `${equipped.length} / ${maxSlots}`;
  }

  search.addEventListener('input', renderCatalog);
  filter.addEventListener('change', renderCatalog);

  renderEquipped();
  renderCatalog();

  return {
    close
  };
}
