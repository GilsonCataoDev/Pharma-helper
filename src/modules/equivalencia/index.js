// ========================================
// FarmaApp — Equivalência de Medicamentos Module
// ========================================

import * as SearchBar from '../../components/SearchBar.js';
import { searchEquivalencias, getFormasFarmaceuticas } from '../../db/database.js';

/** @type {Array} Current search results */
let results = [];

/** @type {string[]} Available formas */
let formas = [];

/** @type {string} Current search query */
let currentQuery = '';

/** @type {string} Current forma filter */
let currentFormaFilter = '';

// ──────────────────────────────────────
// Render
// ──────────────────────────────────────

/**
 * Renders the equivalencia module.
 * @returns {string} HTML string.
 */
export function render() {
  const searchHtml = SearchBar.render({
    placeholder: 'Buscar por nome comercial, genérico ou princípio ativo...',
    id: 'equiv-search',
    value: currentQuery,
  });

  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Search -->
      <div class="animate-fade-in">
        ${searchHtml}
      </div>

      <!-- Filter Chips -->
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 animate-fade-in" style="animation-delay: 0.05s;" id="equiv-filters">
        <button class="filter-chip ${currentFormaFilter === '' ? 'active' : ''}" data-forma="">Todos</button>
        <!-- Chips populated dynamically -->
      </div>

      <!-- Results count -->
      <div class="animate-fade-in" style="animation-delay: 0.1s;">
        <p class="text-xs text-gray-400" id="equiv-count">Busque um medicamento acima</p>
      </div>

      <!-- Results -->
      <div class="space-y-3" id="equiv-results">
        ${renderResults()}
      </div>
    </div>
  `;
}

/**
 * Render result cards grouped by principioAtivo.
 */
function renderResults() {
  if (results.length === 0 && currentQuery) {
    return /* html */ `
      <div class="text-center py-10 animate-fade-in">
        <i data-lucide="search-x" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
        <p class="text-sm text-gray-400">Nenhum resultado encontrado</p>
        <p class="text-xs text-gray-300 mt-1">Tente outro termo de busca</p>
      </div>
    `;
  }

  if (results.length === 0) {
    return /* html */ `
      <div class="text-center py-10 animate-fade-in">
        <i data-lucide="pill" class="w-12 h-12 text-gray-200 mx-auto mb-3"></i>
        <p class="text-sm text-gray-400">Digite o nome de um medicamento</p>
        <p class="text-xs text-gray-300 mt-1">para buscar equivalências</p>
      </div>
    `;
  }

  // Group by principioAtivo
  const grouped = {};
  results.forEach((item) => {
    if (!grouped[item.principioAtivo]) {
      grouped[item.principioAtivo] = [];
    }
    grouped[item.principioAtivo].push(item);
  });

  let html = '';
  let i = 0;

  for (const [principio, items] of Object.entries(grouped)) {
    const referenciasSet = [...new Set(items.map((x) => x.referencia))];
    const genericosSet = [...new Set(items.map((x) => x.generico))];

    const presentationsHtml = items.map((item) => /* html */ `
      <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
        <span class="text-xs text-gray-600">${item.forma}</span>
        <span class="text-xs font-medium text-gray-800">${item.concentracao}</span>
      </div>
    `).join('');

    html += /* html */ `
      <div class="pharma-card stagger-item animate-fade-in" style="opacity: 0; animation-delay: ${i * 0.06}s;">
        <!-- Princípio Ativo -->
        <div class="flex items-start gap-3 mb-3">
          <div class="bg-emerald-100 rounded-xl p-2 flex-shrink-0">
            <i data-lucide="flask-conical" class="w-4 h-4 text-emerald-700"></i>
          </div>
          <div class="min-w-0">
            <h3 class="font-bold text-sm text-gray-800">${principio}</h3>
          </div>
        </div>

        <!-- Referência -->
        <div class="mb-2">
          <p class="text-[0.65rem] uppercase tracking-wider font-semibold text-gray-400 mb-1">Referência</p>
          <div class="flex flex-wrap gap-1.5">
            ${referenciasSet.map((r) => `<span class="info-badge info-badge--blue text-xs">${r}</span>`).join('')}
          </div>
        </div>

        <!-- Genéricos -->
        <div class="mb-3">
          <p class="text-[0.65rem] uppercase tracking-wider font-semibold text-gray-400 mb-1">Genérico</p>
          <div class="flex flex-wrap gap-1.5">
            ${genericosSet.map((g) => `<span class="info-badge info-badge--green text-xs">${g}</span>`).join('')}
          </div>
        </div>

        <!-- Apresentações -->
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-[0.65rem] uppercase tracking-wider font-semibold text-gray-400 mb-2">Apresentações</p>
          ${presentationsHtml}
        </div>
      </div>
    `;
    i++;
  }

  return html;
}

// ──────────────────────────────────────
// Init — Event Listeners
// ──────────────────────────────────────

/**
 * Initialize equivalencia module.
 */
export async function init() {
  // Load available formas
  formas = await getFormasFarmaceuticas();
  renderFilterChips();

  // If there's a previous query, re-run it
  if (currentQuery) {
    await doSearch(currentQuery);
  }

  // Bind search
  SearchBar.init('equiv-search', 250, async (query) => {
    currentQuery = query;
    await doSearch(query);
  });

  // Bind filter chips (event delegation)
  const filtersEl = document.getElementById('equiv-filters');
  if (filtersEl) {
    filtersEl.addEventListener('click', async (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      currentFormaFilter = chip.dataset.forma || '';

      // Update active state
      filtersEl.querySelectorAll('.filter-chip').forEach((c) => {
        c.classList.toggle('active', c.dataset.forma === currentFormaFilter);
      });

      await doSearch(currentQuery);
    });
  }
}

/**
 * Populate filter chips.
 */
function renderFilterChips() {
  const filtersEl = document.getElementById('equiv-filters');
  if (!filtersEl) return;

  let html = `<button class="filter-chip ${currentFormaFilter === '' ? 'active' : ''}" data-forma="">Todos</button>`;

  formas.forEach((forma) => {
    const isActive = currentFormaFilter === forma;
    html += `<button class="filter-chip ${isActive ? 'active' : ''}" data-forma="${forma}">${forma}</button>`;
  });

  filtersEl.innerHTML = html;
}

/**
 * Run a search and update the results area.
 */
async function doSearch(query) {
  results = await searchEquivalencias(query, currentFormaFilter);

  const resultsEl = document.getElementById('equiv-results');
  const countEl = document.getElementById('equiv-count');

  if (resultsEl) {
    resultsEl.innerHTML = renderResults();
    if (window.lucide) lucide.createIcons();
  }

  if (countEl) {
    if (query || currentFormaFilter) {
      const grouped = {};
      results.forEach((r) => { grouped[r.principioAtivo] = true; });
      const groupCount = Object.keys(grouped).length;
      countEl.textContent = `${results.length} apresentação(ões) — ${groupCount} princípio(s) ativo(s)`;
    } else {
      countEl.textContent = 'Busque um medicamento acima';
    }
  }
}

/**
 * Reset module state.
 */
export function destroy() {
  results = [];
  currentQuery = '';
  currentFormaFilter = '';
}
