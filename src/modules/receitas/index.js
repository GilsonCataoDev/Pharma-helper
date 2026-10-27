// ========================================
// FarmaApp — Checagem de Receitas Module
// ========================================

import { getReceitasRegras } from '../../db/database.js';

/** @type {Array} Cached rules from DB */
let regras = [];

/** @type {object|null} Currently selected prescription type */
let selectedRegra = null;

/** @type {Set<number>} Checked item indices */
let checkedItems = new Set();

// ──────────────────────────────────────
// Render
// ──────────────────────────────────────

/**
 * Renders the Receitas module.
 * @returns {string} HTML string.
 */
export function render() {
  // If a rule is selected, show the checklist screen
  if (selectedRegra) {
    return renderChecklist();
  }
  // Otherwise show the type selection screen
  return renderTypeSelection();
}

/**
 * Screen 1: Select prescription type.
 */
function renderTypeSelection() {
  const typeCardsHtml = regras.map((regra, index) => {
    const listaBadge = getListaBadge(regra.lista);
    return /* html */ `
      <button
        class="prescription-type-card text-left w-full stagger-item animate-fade-in"
        style="opacity: 0; animation-delay: ${index * 0.06}s;"
        data-type-index="${index}"
        aria-label="Selecionar ${regra.tipo}"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-semibold text-sm text-gray-800 leading-tight">${regra.tipo}</h3>
            <p class="text-xs text-gray-500 mt-1">${regra.lista}</p>
          </div>
          <div class="flex-shrink-0">
            ${listaBadge}
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <span class="info-badge info-badge--blue">
            <i data-lucide="calendar" class="w-3 h-3"></i>
            ${regra.validade} dias
          </span>
          <span class="info-badge ${regra.retencao === 'Não retém' ? 'info-badge--green' : 'info-badge--yellow'}">
            <i data-lucide="${regra.retencao === 'Não retém' ? 'unlock' : 'lock'}" class="w-3 h-3"></i>
            ${regra.retencao}
          </span>
        </div>
      </button>
    `;
  }).join('');

  return /* html */ `
    <div class="p-4 space-y-4">
      <div class="animate-fade-in">
        <h2 class="text-base font-bold text-gray-800">Selecione o Tipo de Receita</h2>
        <p class="text-xs text-gray-500 mt-1">Escolha o tipo para ver os requisitos de conferência</p>
      </div>

      <div class="space-y-3" id="receitas-type-list">
        ${typeCardsHtml}
      </div>
    </div>
  `;
}

/**
 * Screen 2: Interactive checklist for the selected prescription type.
 */
function renderChecklist() {
  const items = selectedRegra.itensObrigatorios || [];
  const allChecked = checkedItems.size === items.length;

  const checklistHtml = items.map((item, i) => {
    const isChecked = checkedItems.has(i);
    return /* html */ `
      <li class="checklist-item ${isChecked ? 'checked' : ''}" data-check-index="${i}" role="checkbox" aria-checked="${isChecked}" tabindex="0">
        <div class="checklist-checkbox" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="checklist-label">${item}</span>
      </li>
    `;
  }).join('');

  // Result banner
  let resultHtml = '';
  if (allChecked && items.length > 0) {
    resultHtml = /* html */ `
      <div class="result-banner result-banner--ok animate-slide-up">
        <i data-lucide="check-circle" class="w-5 h-5 flex-shrink-0"></i>
        <span>Receita OK para dispensação!</span>
      </div>
    `;
  } else if (checkedItems.size > 0 && checkedItems.size < items.length) {
    const missing = items.length - checkedItems.size;
    resultHtml = /* html */ `
      <div class="result-banner result-banner--error animate-slide-up">
        <i data-lucide="alert-circle" class="w-5 h-5 flex-shrink-0"></i>
        <span>${missing} item(ns) obrigatório(s) pendente(s)</span>
      </div>
    `;
  }

  const listaBadge = getListaBadge(selectedRegra.lista);

  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Back Button -->
      <button id="receitas-back-btn" class="flex items-center gap-1 text-emerald-600 font-medium text-sm animate-fade-in" aria-label="Voltar">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Voltar</span>
      </button>

      <!-- Header Card -->
      <div class="pharma-card animate-fade-in" style="animation-delay: 0.05s;">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="font-bold text-sm text-gray-800">${selectedRegra.tipo}</h2>
            <p class="text-xs text-gray-500 mt-1">${selectedRegra.lista}</p>
          </div>
          ${listaBadge}
        </div>

        <!-- Info Badges -->
        <div class="flex flex-wrap gap-2 mt-3">
          <span class="info-badge info-badge--blue">
            <i data-lucide="calendar" class="w-3 h-3"></i>
            Válida por ${selectedRegra.validade} dias
          </span>
          <span class="info-badge ${selectedRegra.retencao === 'Não retém' ? 'info-badge--green' : 'info-badge--yellow'}">
            <i data-lucide="${selectedRegra.retencao === 'Não retém' ? 'unlock' : 'lock'}" class="w-3 h-3"></i>
            ${selectedRegra.retencao}
          </span>
          <span class="info-badge info-badge--green">
            <i data-lucide="hash" class="w-3 h-3"></i>
            ${selectedRegra.quantidadeMax}
          </span>
        </div>
      </div>

      <!-- Checklist -->
      <div class="pharma-card !p-0 animate-fade-in" style="animation-delay: 0.1s;">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="font-semibold text-sm text-gray-700">Itens Obrigatórios</h3>
          <span class="text-xs text-gray-400">${checkedItems.size}/${items.length}</span>
        </div>
        <ul class="checklist" id="receitas-checklist" role="list">
          ${checklistHtml}
        </ul>
      </div>

      <!-- Result Banner -->
      <div id="receitas-result">
        ${resultHtml}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 animate-fade-in" style="animation-delay: 0.15s;">
        <button id="receitas-check-all" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
          ${allChecked ? 'bg-gray-100 text-gray-400' : 'bg-emerald-600 text-white active:bg-emerald-700'}">
          ${allChecked ? 'Tudo Verificado ✓' : 'Marcar Todos'}
        </button>
        <button id="receitas-reset" class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 active:bg-gray-200 transition-colors">
          Limpar
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

/**
 * Returns a colored badge based on the lista type.
 */
function getListaBadge(lista) {
  if (lista.includes('A1') || lista.includes('A2') || lista.includes('A3') || lista.includes('Entorpecente')) {
    return '<span class="severity-badge" style="background:#dc2626;color:white;">A</span>';
  }
  if (lista.includes('B1') || lista.includes('B2') || lista.includes('Psicotrópico')) {
    return '<span class="severity-badge" style="background:#3b82f6;color:white;">B</span>';
  }
  if (lista.includes('C1') || lista.includes('C2') || lista.includes('C5') || lista.includes('Especial') || lista.includes('Retinóide')) {
    return '<span class="severity-badge" style="background:#f59e0b;color:white;">C</span>';
  }
  if (lista.includes('Antimicrobiano')) {
    return '<span class="severity-badge" style="background:#8b5cf6;color:white;">ATM</span>';
  }
  return '<span class="severity-badge" style="background:#6b7280;color:white;">—</span>';
}

// ──────────────────────────────────────
// Init — Event Listeners
// ──────────────────────────────────────

/**
 * Initialize the receitas module: load data & bind events.
 */
export async function init() {
  // Load rules from DB
  regras = await getReceitasRegras();

  // If we don't have a selectedRegra, we're on the type selection screen
  if (!selectedRegra) {
    // Re-render now that data is loaded
    const content = document.getElementById('module-content');
    if (content && regras.length > 0) {
      content.innerHTML = renderTypeSelection();
      if (window.lucide) lucide.createIcons();
    }
    bindTypeSelection();
  } else {
    bindChecklist();
  }
}

/**
 * Bind type selection card clicks.
 */
function bindTypeSelection() {
  const list = document.getElementById('receitas-type-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const card = e.target.closest('[data-type-index]');
    if (!card) return;

    const index = parseInt(card.dataset.typeIndex, 10);
    selectedRegra = regras[index];
    checkedItems.clear();

    // Re-render the module
    const content = document.getElementById('module-content');
    if (content) {
      content.innerHTML = renderChecklist();
      if (window.lucide) lucide.createIcons();
      bindChecklist();
    }
  });
}

/**
 * Bind checklist interactions.
 */
function bindChecklist() {
  const checklistEl = document.getElementById('receitas-checklist');
  const backBtn = document.getElementById('receitas-back-btn');
  const checkAllBtn = document.getElementById('receitas-check-all');
  const resetBtn = document.getElementById('receitas-reset');

  // Toggle individual items
  if (checklistEl) {
    checklistEl.addEventListener('click', (e) => {
      const item = e.target.closest('.checklist-item');
      if (!item) return;

      const idx = parseInt(item.dataset.checkIndex, 10);
      if (checkedItems.has(idx)) {
        checkedItems.delete(idx);
      } else {
        checkedItems.add(idx);
      }

      refreshChecklist();
    });
  }

  // Back to type selection
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      selectedRegra = null;
      checkedItems.clear();

      const content = document.getElementById('module-content');
      if (content) {
        content.innerHTML = renderTypeSelection();
        if (window.lucide) lucide.createIcons();
        bindTypeSelection();
      }
    });
  }

  // Check all
  if (checkAllBtn) {
    checkAllBtn.addEventListener('click', () => {
      if (!selectedRegra) return;
      const items = selectedRegra.itensObrigatorios || [];
      if (checkedItems.size === items.length) return;

      items.forEach((_, i) => checkedItems.add(i));
      refreshChecklist();
    });
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      checkedItems.clear();
      refreshChecklist();
    });
  }
}

/**
 * Refresh the checklist UI without full re-render.
 */
function refreshChecklist() {
  const content = document.getElementById('module-content');
  if (content) {
    content.innerHTML = renderChecklist();
    if (window.lucide) lucide.createIcons();
    bindChecklist();
  }
}

/**
 * Reset module state (called when navigating away).
 */
export function destroy() {
  selectedRegra = null;
  checkedItems.clear();
  regras = [];
}
