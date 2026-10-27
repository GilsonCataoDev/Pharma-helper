// ========================================
// FarmaApp — Bottom Navigation Bar Component
// ========================================

/**
 * Tab definitions for the bottom nav.
 */
const TABS = [
  { id: 'home',         hash: '#/',             icon: 'home',             label: 'Início' },
  { id: 'receitas',     hash: '#/receitas',     icon: 'clipboard-check',  label: 'Receitas' },
  { id: 'interacoes',   hash: '#/interacoes',   icon: 'alert-triangle',   label: 'Interações' },
  { id: 'equivalencia', hash: '#/equivalencia', icon: 'pill',             label: 'Equivalência' },
  { id: 'mais',         hash: null,             icon: 'menu',             label: 'Mais' },
];

/**
 * Extra menu items shown in the "Mais" dropdown.
 */
const MORE_ITEMS = [
  { hash: '#/calculadora',  icon: 'calculator',     label: 'Calculadora de Doses' },
  { hash: '#/pedidos',      icon: 'package-check',  label: 'Conferência de Pedidos' },
  { hash: '#/indicacoes',   icon: 'stethoscope',    label: 'Guia de Indicações MIPs' },
];

/**
 * Renders the bottom navigation bar.
 * @param {string} currentHash - Current location hash.
 * @returns {string} HTML string.
 */
export function render(currentHash = '#/') {
  const isMoreActive = MORE_ITEMS.some(item => item.hash === currentHash);

  const tabsHtml = TABS.map((tab) => {
    const isActive = tab.hash ? currentHash === tab.hash : (tab.id === 'mais' && isMoreActive);
    const activeClass = isActive ? 'active' : '';

    if (tab.id === 'mais') {
      return /* html */ `
        <button
          type="button"
          class="nav-tab ${activeClass}"
          id="nav-more-btn"
          aria-label="Mais opções"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i data-lucide="${tab.icon}"></i>
          <span>${tab.label}</span>
        </button>
      `;
    }

    return /* html */ `
      <a href="${tab.hash}" class="nav-tab ${activeClass}" aria-label="${tab.label}">
        <i data-lucide="${tab.icon}"></i>
        <span>${tab.label}</span>
      </a>
    `;
  }).join('');

  const moreItemsHtml = MORE_ITEMS.map((item) => /* html */ `
    <a href="${item.hash}" class="more-menu-item flex items-center justify-between" data-more-link>
      <div class="flex items-center gap-3">
        <i data-lucide="${item.icon}" class="w-4 h-4 text-emerald-600"></i>
        <span class="text-xs font-semibold text-gray-800">${item.label}</span>
      </div>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-gray-300"></i>
    </a>
  `).join('');

  return /* html */ `
    <!-- More Menu Overlay -->
    <div class="more-menu-overlay" id="more-menu-overlay"></div>

    <!-- More Menu Dropdown -->
    <nav class="more-menu" id="more-menu" role="menu" aria-label="Mais opções">
      <div class="px-3 py-2 border-b border-gray-100 text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">
        Outras Ferramentas
      </div>
      ${moreItemsHtml}
    </nav>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav" role="navigation" aria-label="Navegação principal">
      ${tabsHtml}
    </nav>
  `;
}

/**
 * Initializes the "Mais" dropdown toggle behavior.
 */
export function init() {
  const btn = document.getElementById('nav-more-btn');
  const menu = document.getElementById('more-menu');
  const overlay = document.getElementById('more-menu-overlay');

  if (!btn || !menu || !overlay) return;

  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  menu.querySelectorAll('[data-more-link]').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}
