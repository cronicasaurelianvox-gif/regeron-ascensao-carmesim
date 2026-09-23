export function openHabilidadesModal(player = {}, options = {}) {
  const { onClose } = options || {};

  if (document.querySelector('.habilidades-modal-shell')) return;

  const draft = JSON.parse(JSON.stringify(player || {}));

  const normalizeValue = (value) => {
    if (value === undefined || value === null || value === '') return '';
    return String(value);
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [value];
  };

  const normalizeAbility = (ability, index) => {
    if (typeof ability === 'string') {
      return {
        id: `ability-${index}`,
        name: ability,
        description: 'Habilidade disponível para o personagem.',
        type: 'Geral',
        action: '',
        cooldown: '',
        duration: '',
        targets: '',
        cost: '',
        image: '',
        buffs: [],
        debuffs: []
      };
    }

    const raw = ability || {};
    const listBuffs = normalizeArray(raw.buffs || raw.buff || raw.buffsList)
      .map((item) => {
        if (typeof item === 'string') {
          return { name: item, description: '' };
        }

        return {
          name: item?.name || item?.title || 'Buff',
          description: item?.description || item?.text || ''
        };
      })
      .filter((item) => item && item.name);

    const listDebuffs = normalizeArray(raw.debuffs || raw.debuff || raw.debuffsList)
      .map((item) => {
        if (typeof item === 'string') {
          return { name: item, description: '' };
        }

        return {
          name: item?.name || item?.title || 'Debuff',
          description: item?.description || item?.text || ''
        };
      })
      .filter((item) => item && item.name);

    return {
      id: raw.id || raw.slug || raw.name || `ability-${index}`,
      name: raw.name || raw.title || `Habilidade ${index + 1}`,
      description:
        raw.description ||
        raw.text ||
        raw.summary ||
        'A habilidade ainda não possui descrição detalhada.',
      type: raw.type || raw.category || raw.kind || raw.classification || 'Geral',
      action: raw.action || raw.acao || raw.actionType || '',
      cooldown: raw.cooldown || raw.recarga || raw.recharge || raw.refresh || '',
      duration: raw.duration || raw.duracao || raw.effectDuration || '',
      targets: raw.targets || raw.alvos || raw.target || raw.range || '',
      cost: raw.cost || raw.custo || raw.resourceCost || raw.manaCost || '',
      image: raw.image || raw.icon || raw.art || raw.sprite || '',
      buffs: listBuffs,
      debuffs: listDebuffs,
      isPassive: !!raw.passive,
      conditions: normalizeArray(raw.conditions || raw.conditionId || raw.conditionIds)
    };
  };

  const abilityList = Array.isArray(draft.abilities) ? draft.abilities.map(normalizeAbility) : [];
  const globalList = Array.isArray(window?.HABILIDADE_CATALOG)
    ? window.HABILIDADE_CATALOG.map(normalizeAbility)
    : [];
  const catalog = globalList.length ? globalList : abilityList;

  const shell = document.createElement('div');
  shell.className = 'habilidades-modal-shell';
  shell.innerHTML = `
    <div class="habilidades-modal-overlay" role="presentation"></div>
    <div class="habilidades-modal" role="dialog" aria-label="Habilidades do personagem">
      <header class="habilidades-modal__header">
        <div class="habilidades-modal__heading">
          <div class="habilidades-modal__title-wrap">
            <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
            <h3 class="habilidades-modal__title">HABILIDADES</h3>
          </div>
          <p class="habilidades-modal__subtitle">Consulte as técnicas e poderes disponíveis ao personagem.</p>
        </div>
        <button class="habilidades-modal__close" aria-label="Fechar">✕</button>
      </header>

      <div class="habilidades-modal__toolbar">
        <label class="habilidades-search-wrap" aria-label="Pesquisar habilidades">
          <span class="habilidades-search__icon">⌕</span>
          <input class="habilidades-search" placeholder="Pesquisar habilidades..." />
        </label>
        <select class="habilidades-filter" aria-label="Filtrar habilidades">
          <option value="all">Todas</option>
        </select>
      </div>

      <div class="habilidades-modal__body">
        <aside class="habilidades-list-panel">
          <div class="habilidades-list-panel__header">
            <span class="section-label">SUAS HABILIDADES</span>
          </div>
          <div class="habilidades-list__stack"></div>
        </aside>

        <section class="habilidades-detail-panel">
          <div class="habilidades-detail__content"></div>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(shell);
  document.body.classList.add('habilidades-modal-open');

  const overlay = shell.querySelector('.habilidades-modal-overlay');
  const closeBtn = shell.querySelector('.habilidades-modal__close');
  const search = shell.querySelector('.habilidades-search');
  const filter = shell.querySelector('.habilidades-filter');
  const listStack = shell.querySelector('.habilidades-list__stack');
  const detailContent = shell.querySelector('.habilidades-detail__content');

  const getUniqueTypes = () => {
    const values = catalog
      .map((ability) => normalizeValue(ability.type || ability.category || ability.kind || 'Geral'))
      .filter(Boolean)
      .map((value) => value.trim());

    return [...new Set(values)];
  };

  const allTypes = getUniqueTypes();
  if (allTypes.length) {
    filter.innerHTML =
      '<option value="all">Todas</option>' +
      allTypes.map((type) => `<option value="${type}">${type}</option>`).join('');
  }

  let selectedId = '';

  const getFilteredAbilities = () => {
    const q = (search.value || '').toLowerCase().trim();
    const category = filter.value || 'all';

    return catalog.filter((ability) => {
      const haystack = [
        ability.name,
        ability.description,
        ability.type,
        ability.action,
        ability.cooldown,
        ability.duration,
        ability.targets,
        ability.cost,
        ...(ability.buffs || []).map((item) => item?.name || ''),
        ...(ability.debuffs || []).map((item) => item?.name || '')
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = !q || haystack.includes(q);
      const matchesFilter = category === 'all' || (ability.type || 'Geral') === category;
      return matchesQuery && matchesFilter;
    });
  };

  const renderCardList = (items) => {
    if (!items.length) {
      listStack.innerHTML = `
        <div class="habilidade-empty">
          <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
          <strong>NENHUMA HABILIDADE</strong>
          <span>Novas habilidades serão desbloqueadas durante a evolução do personagem.</span>
        </div>
      `;
      detailContent.innerHTML = '';
      selectedId = '';
      return;
    }

    if (!selectedId || !items.some((ability) => ability.id === selectedId)) {
      selectedId = items[0].id;
    }

    listStack.innerHTML = items
      .map((ability) => {
        const safeName = normalizeValue(ability.name);
        const safeType = normalizeValue(ability.type || 'Geral');
        const safeCooldown = normalizeValue(ability.cooldown || '');
        const safeCost = normalizeValue(ability.cost || '');
        const isSelected = ability.id === selectedId;

        return `
          <button type="button" class="habilidade-card ${isSelected ? 'is-selected' : ''}" data-id="${ability.id}">
            <div class="habilidade-card__icon-wrap">
              ${ability.image ? `<img class="habilidade-card__image" src="${ability.image}" alt="${safeName}" />` : `<img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />`}
            </div>
            <div class="habilidade-card__meta">
              <strong>${safeName}</strong>
              <span>${safeType}</span>
            </div>
            <div class="habilidade-card__stats">
              <small>${safeCost ? `⚡ ${safeCost}` : '⚡ —'}</small>
              <small>${safeCooldown ? `⟳ ${safeCooldown}` : '⟳ —'}</small>
            </div>
          </button>
        `;
      })
      .join('');

    listStack.querySelectorAll('.habilidade-card').forEach((button) => {
      button.addEventListener('click', () => {
        const nextId = button.dataset.id;
        if (!nextId) return;
        selectedId = nextId;
        render();
      });
    });

    renderDetail(items);
  };

  const renderDetail = (items) => {
    const selected = items.find((ability) => ability.id === selectedId) || items[0];
    if (!selected) {
      detailContent.innerHTML = '';
      return;
    }

    const buffs = normalizeArray(selected.buffs || []);
    const debuffs = normalizeArray(selected.debuffs || []);
    const safeName = normalizeValue(selected.name);
    const safeType = normalizeValue(selected.type || 'Geral');
    const safeDescription = normalizeValue(selected.description || '');
    const safeAction = normalizeValue(selected.action || '');
    const safeCooldown = normalizeValue(selected.cooldown || '');
    const safeDuration = normalizeValue(selected.duration || '');
    const safeTargets = normalizeValue(selected.targets || '');
    const safeCost = normalizeValue(selected.cost || '');
    const safeImage = normalizeValue(selected.image || '');

    detailContent.innerHTML = `
      <div class="habilidade-detail__art ${safeImage ? '' : 'is-fallback'}">
        ${safeImage ? `<img src="${safeImage}" alt="${safeName}" />` : `<img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />`}
      </div>

      <div class="habilidade-detail__header">
        <div>
          <h4>${safeName}</h4>
          ${safeType ? `<span>${safeType}</span>` : ''}
        </div>
      </div>

      <div class="habilidade-detail__description">
        <div class="habilidade-detail__ornament" aria-hidden="true"></div>
        <p>${safeDescription || 'Descrição ainda não disponível.'}</p>
      </div>

      <div class="habilidade-detail__stats">
        ${safeAction ? `<div class="habilidade-stat"><span>⚔ AÇÃO</span><strong>${safeAction}</strong></div>` : ''}
        ${safeCooldown ? `<div class="habilidade-stat"><span>⟳ RECARGA</span><strong>${safeCooldown}</strong></div>` : ''}
        ${safeDuration ? `<div class="habilidade-stat"><span>◷ DURAÇÃO</span><strong>${safeDuration}</strong></div>` : ''}
        ${safeTargets ? `<div class="habilidade-stat"><span>◎ ALVOS</span><strong>${safeTargets}</strong></div>` : ''}
        ${safeCost ? `<div class="habilidade-stat habilidade-stat--cost"><span>◆ CUSTO</span><strong>${safeCost}</strong></div>` : ''}
      </div>

      ${
        buffs.length || debuffs.length
          ? `
        <div class="habilidade-detail__conditions">
          ${
            buffs.length
              ? `
            <div class="habilidade-condition-group habilidade-condition-group--buff">
              <h5>BUFFS</h5>
              <div class="habilidade-condition-list">
                ${buffs
                  .map(
                    (item) => `
                      <span class="condition-chip condition-chip--buff" title="${normalizeValue(item.description || item.name)}">
                        ✦ ${normalizeValue(item.name)}
                      </span>
                    `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          ${
            debuffs.length
              ? `
            <div class="habilidade-condition-group habilidade-condition-group--debuff">
              <h5>DEBUFFS</h5>
              <div class="habilidade-condition-list">
                ${debuffs
                  .map(
                    (item) => `
                      <span class="condition-chip condition-chip--debuff" title="${normalizeValue(item.description || item.name)}">
                        ☠ ${normalizeValue(item.name)}
                      </span>
                    `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
      `
          : `
        <div class="habilidade-detail__empty-condition">
          <span>Nenhuma condição aplicada.</span>
        </div>
      `
      }
    `;
  };

  function render() {
    const items = getFilteredAbilities();
    renderCardList(items);
  }

  const close = () => {
    shell.remove();
    document.body.classList.remove('habilidades-modal-open');
    if (typeof onClose === 'function') onClose();
  };

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  search.addEventListener('input', render);
  filter.addEventListener('change', render);

  render();

  return {
    close
  };
}
