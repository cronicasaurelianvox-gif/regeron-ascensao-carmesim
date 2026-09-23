export function openInventarioModal(player = {}, options = {}) {
  const { onClose } = options || {};

  if (document.querySelector('.inventario-modal-shell')) return;

  const draft = JSON.parse(JSON.stringify(player || {}));
  const inventory = Array.isArray(draft.inventory) ? draft.inventory.slice() : [];

  const normalizeText = (value) => {
    if (value === undefined || value === null || value === '') return '';
    return String(value);
  };

  const normalizeItem = (item, index) => {
    if (typeof item === 'string') {
      return {
        id: `inventory-${index}`,
        name: item,
        type: 'Item',
        rarity: 'Comum',
        level: '',
        roll: '',
        quantity: 1,
        description: 'Item disponível no inventário.',
        image: ''
      };
    }

    return {
      id: item?.id || item?.slug || `inventory-${index}`,
      name: item?.name || item?.title || `Item ${index + 1}`,
      type: item?.type || item?.category || 'Item',
      rarity: item?.rarity || item?.rareza || 'Comum',
      level: item?.level || item?.nivel || '',
      roll: item?.roll || item?.bonus || item?.mod || '',
      quantity: item?.quantity ?? item?.count ?? item?.qtd ?? 1,
      description: item?.description || item?.descricao || 'Descrição do item não disponível.',
      image: item?.image || item?.icon || item?.sprite || ''
    };
  };

  const items = inventory.map(normalizeItem);

  const shell = document.createElement('div');
  shell.className = 'inventario-modal-shell';
  shell.innerHTML = `
    <div class="inventario-modal-overlay" role="presentation"></div>
    <div class="inventario-modal" role="dialog" aria-label="Inventário do personagem">
      <header class="inventario-modal__header">
        <div class="inventario-modal__heading">
          <div class="inventario-modal__title-wrap">
            <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
            <h3 class="inventario-modal__title">INVENTÁRIO</h3>
          </div>
          <p class="inventario-modal__subtitle">Gerencie os equipamentos, materiais e itens carregados pelo personagem.</p>
        </div>
        <button class="inventario-modal__close" aria-label="Fechar">✕</button>
      </header>

      <div class="inventario-modal__toolbar">
        <label class="inventario-search-wrap" aria-label="Pesquisar itens">
          <span class="inventario-search__icon">⌕</span>
          <input class="inventario-search" placeholder="Pesquisar itens..." />
        </label>
        <select class="inventario-filter" aria-label="Filtrar itens">
          <option value="all">Todos</option>
        </select>
      </div>

      <div class="inventario-modal__body">
        <aside class="inventario-list-panel">
          <div class="inventario-list-panel__header">
            <span class="section-label">SEUS ITENS</span>
          </div>
          <div class="inventario-list__stack"></div>
        </aside>

        <section class="inventario-detail-panel">
          <div class="inventario-detail__content"></div>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(shell);
  document.body.classList.add('inventario-modal-open');

  const overlay = shell.querySelector('.inventario-modal-overlay');
  const closeBtn = shell.querySelector('.inventario-modal__close');
  const search = shell.querySelector('.inventario-search');
  const filter = shell.querySelector('.inventario-filter');
  const listStack = shell.querySelector('.inventario-list__stack');
  const detailContent = shell.querySelector('.inventario-detail__content');

  const typeOptions = [...new Set(items.map((item) => normalizeText(item.type)).filter(Boolean))];
  if (typeOptions.length) {
    filter.innerHTML =
      '<option value="all">Todos</option>' +
      typeOptions.map((type) => `<option value="${type}">${type}</option>`).join('');
  }

  let selectedId = '';

  const getFilteredItems = () => {
    const q = (search.value || '').toLowerCase().trim();
    const selectedType = filter.value || 'all';

    return items.filter((item) => {
      const haystack = [
        item.name,
        item.type,
        item.rarity,
        item.description,
        item.roll,
        item.level,
        item.quantity
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = !q || haystack.includes(q);
      const matchesType = selectedType === 'all' || item.type === selectedType;
      return matchesQuery && matchesType;
    });
  };

  const renderList = (filteredItems) => {
    if (!filteredItems.length) {
      listStack.innerHTML = `
        <div class="inventario-empty">
          <img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />
          <strong>SEM ITENS</strong>
          <span>Seu inventário está vazio no momento.</span>
        </div>
      `;
      detailContent.innerHTML = '';
      selectedId = '';
      return;
    }

    if (!selectedId || !filteredItems.some((item) => item.id === selectedId)) {
      selectedId = filteredItems[0].id;
    }

    listStack.innerHTML = filteredItems
      .map((item) => {
        const isSelected = item.id === selectedId;
        const rarity = normalizeText(item.rarity || 'Comum');
        const type = normalizeText(item.type || 'Item');
        const quantity = normalizeText(item.quantity ?? '');
        const level = normalizeText(item.level || '');

        return `
          <button type="button" class="inventario-item-card ${isSelected ? 'is-selected' : ''}" data-id="${item.id}">
            <div class="inventario-item-card__image-wrap">
              ${item.image ? `<img src="${item.image}" alt="${normalizeText(item.name)}" />` : `<img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />`}
            </div>
            <div class="inventario-item-card__meta">
              <strong>${normalizeText(item.name)}</strong>
              <span class="inventario-item-card__rarity inventario-item-card__rarity--${rarity.toLowerCase()}">${rarity}</span>
            </div>
            <div class="inventario-item-card__stats">
              <small>${type}</small>
              <small>${level ? `Nível ${level}` : '—'}</small>
            </div>
            <div class="inventario-item-card__qty">QTD. ${quantity || 1}</div>
          </button>
        `;
      })
      .join('');

    listStack.querySelectorAll('.inventario-item-card').forEach((button) => {
      button.addEventListener('click', () => {
        selectedId = button.dataset.id || '';
        render();
      });
    });

    renderDetail(filteredItems);
  };

  const renderDetail = (filteredItems) => {
    const selected = filteredItems.find((item) => item.id === selectedId) || filteredItems[0];
    if (!selected) {
      detailContent.innerHTML = '';
      return;
    }

    const rarity = normalizeText(selected.rarity || 'Comum');
    const type = normalizeText(selected.type || 'Item');
    const level = normalizeText(selected.level || '');
    const roll = normalizeText(selected.roll || '');
    const quantity = normalizeText(selected.quantity ?? '');

    detailContent.innerHTML = `
      <div class="inventario-detail__art ${selected.image ? '' : 'is-fallback'}">
        ${selected.image ? `<img src="${selected.image}" alt="${normalizeText(selected.name)}" />` : `<img class="diamond-icon" src="https://i.imgur.com/brHmEjl.png" alt="" aria-hidden="true" />`}
      </div>

      <div class="inventario-detail__header">
        <h4>${normalizeText(selected.name)}</h4>
        <span class="inventario-detail__rarity inventario-detail__rarity--${rarity.toLowerCase()}">${rarity}</span>
      </div>

      <div class="inventario-detail__meta">
        ${type ? `<div><span>TIPO</span><strong>${type}</strong></div>` : ''}
        ${level ? `<div><span>NÍVEL</span><strong>${level}</strong></div>` : ''}
        ${roll ? `<div><span>ROLL</span><strong>${roll}</strong></div>` : ''}
        ${quantity ? `<div><span>QUANTIDADE</span><strong>${quantity}</strong></div>` : ''}
      </div>

      <div class="inventario-detail__desc">
        <div class="inventario-detail__ornament" aria-hidden="true"></div>
        <p>${normalizeText(selected.description || 'Descrição do item indisponível.')}</p>
      </div>

      <div class="inventario-detail__actions">
        <button type="button" class="inventario-detail__btn">EQUIPAR</button>
      </div>
    `;
  };

  function render() {
    const filteredItems = getFilteredItems();
    renderList(filteredItems);
  }

  const close = () => {
    shell.remove();
    document.body.classList.remove('inventario-modal-open');
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
