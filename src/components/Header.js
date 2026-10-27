// ========================================
// FarmaApp — Header Component
// ========================================

/**
 * Map of route hashes to subtitle text.
 */
const SUBTITLES = {
  '#/': '',
  '#/receitas': 'Checagem de Receitas',
  '#/equivalencia': 'Equivalência de Medicamentos',
  '#/interacoes': 'Interações Medicamentosas',
  '#/pedidos': 'Controle de Pedidos',
  '#/indicacoes': 'Indicações Farmacêuticas',
  '#/calculadora': 'Calculadora Farmacêutica',
};

/**
 * Renders the app header.
 * @param {string} currentHash - Current location hash.
 * @returns {string} HTML string.
 */
export function render(currentHash = '#/') {
  const subtitle = SUBTITLES[currentHash] || '';

  return /* html */ `
    <header class="app-header" role="banner">
      <div class="flex items-center gap-3 w-full">
        <div class="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
          <i data-lucide="heart-pulse" class="w-5 h-5 text-white"></i>
        </div>
        <div class="flex flex-col min-w-0">
          <h1 class="text-base font-bold leading-tight tracking-tight">FarmaApp</h1>
          ${subtitle
            ? `<span class="text-xs text-emerald-100 truncate leading-tight">${subtitle}</span>`
            : ''
          }
        </div>
      </div>
    </header>
  `;
}
