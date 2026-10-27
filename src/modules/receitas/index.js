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
  if (selectedRegra) {
    return renderChecklist();
  }
  return renderTypeSelection();
}

/**
 * Screen 1: Select prescription type.
 */
function renderTypeSelection() {
  const typeCardsHtml = regras.map((regra, index) => {
    const listaBadge = getListaBadge(regra);
    const listaDesc = getListaDescription(regra);

    return /* html */ `
      <button
        class="prescription-type-card text-left w-full stagger-item animate-fade-in"
        style="opacity: 0; animation-delay: ${index * 0.06}s;"
        data-type-index="${index}"
        aria-label="Selecionar ${regra.tipo}"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-bold text-sm text-gray-800 leading-tight">${regra.tipo}</h3>
            <p class="text-xs text-gray-500 mt-1 leading-normal">${listaDesc}</p>
          </div>
          <div class="flex-shrink-0">
            ${listaBadge}
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <span class="info-badge info-badge--blue text-xs">
            <i data-lucide="calendar" class="w-3 h-3"></i>
            ${regra.validade || 30} dias
          </span>
          <span class="info-badge ${(regra.retencao || '').includes('Não') ? 'info-badge--green' : 'info-badge--yellow'} text-xs">
            <i data-lucide="${(regra.retencao || '').includes('Não') ? 'unlock' : 'lock'}" class="w-3 h-3"></i>
            ${regra.retencao || 'Retém'}
          </span>
        </div>
      </button>
    `;
  }).join('');

  return /* html */ `
    <div class="p-4 space-y-4">
      <div class="animate-fade-in">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <i data-lucide="clipboard-check" class="w-5 h-5 text-emerald-600"></i>
          Selecione o Tipo de Receita
        </h2>
        <p class="text-xs text-gray-500 mt-1">Escolha o modelo para conferir requisitos legais e itens obrigatórios.</p>
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
  const allChecked = checkedItems.size === items.length && items.length > 0;

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
        <span>Receita conferida e OK para dispensação!</span>
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

  const listaBadge = getListaBadge(selectedRegra);
  const listaDesc = getListaDescription(selectedRegra);

  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Back Button -->
      <button id="receitas-back-btn" class="flex items-center gap-1.5 text-emerald-600 font-bold text-xs animate-fade-in" aria-label="Voltar">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Voltar aos Tipos de Receita</span>
      </button>

      <!-- Header Card -->
      <div class="pharma-card animate-fade-in" style="animation-delay: 0.05s;">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="font-bold text-sm text-gray-800">${selectedRegra.tipo}</h2>
            <p class="text-xs text-gray-500 mt-1">${listaDesc}</p>
          </div>
          ${listaBadge}
        </div>

        <!-- Info Badges -->
        <div class="flex flex-wrap gap-2 mt-3">
          <span class="info-badge info-badge--blue text-xs">
            <i data-lucide="calendar" class="w-3 h-3"></i>
            Válida por ${selectedRegra.validade || 30} dias
          </span>
          <span class="info-badge ${(selectedRegra.retencao || '').includes('Não') ? 'info-badge--green' : 'info-badge--yellow'} text-xs">
            <i data-lucide="${(selectedRegra.retencao || '').includes('Não') ? 'unlock' : 'lock'}" class="w-3 h-3"></i>
            ${selectedRegra.retencao || 'Retém'}
          </span>
          <span class="info-badge info-badge--green text-xs">
            <i data-lucide="hash" class="w-3 h-3"></i>
            ${selectedRegra.quantidadeMax || 'Conforme prescrição'}
          </span>
        </div>

        ${selectedRegra.observacoes ? /* html */ `
          <div class="mt-3 pt-2.5 border-t border-gray-100 text-[0.7rem] text-gray-500 leading-normal">
            <strong>Legislação:</strong> ${selectedRegra.observacoes}
          </div>
        ` : ''}
      </div>

      <!-- Checklist -->
      <div class="pharma-card !p-0 animate-fade-in" style="animation-delay: 0.1s;">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="font-bold text-xs uppercase tracking-wider text-gray-700">Itens Obrigatórios de Conferência</h3>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">${checkedItems.size}/${items.length}</span>
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
      <div class="flex gap-2.5 animate-fade-in" style="animation-delay: 0.15s;">
        <button id="receitas-check-all" class="flex-1 py-3 rounded-xl text-xs font-bold transition-colors
          ${allChecked ? 'bg-gray-200 text-gray-500' : 'bg-emerald-600 text-white active:bg-emerald-700 shadow-sm'}">
          ${allChecked ? 'Tudo Conferido ✓' : 'Marcar Todos'}
        </button>
        <button id="receitas-reset" class="px-4 py-3 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 active:bg-gray-200 transition-colors">
          Limpar
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

function getListaDescription(regra) {
  if (!regra) return '';
  if (Array.isArray(regra.listas) && regra.listas.length > 0) {
    return regra.listas.join(', ');
  }
  return regra.lista || regra.descricao || '';
}

function getListaBadge(regra) {
  if (!regra) return '<span class="severity-badge" style="background:#059669;color:white;">LIVRE</span>';

  const codigo = (regra.codigo || '').toUpperCase();
  const raw = [
    regra.tipo || '',
    regra.codigo || '',
    regra.lista || '',
    Array.isArray(regra.listas) ? regra.listas.join(' ') : ''
  ].join(' ').toUpperCase();

  if (raw.includes('A1') || raw.includes('A2') || raw.includes('A3') || raw.includes('ENTORPECENTE')) {
    return '<span class="severity-badge" style="background:#dc2626;color:white;">A (AMARELA)</span>';
  }
  if (raw.includes('B1') || raw.includes('B2') || raw.includes('PSICOTRÓPICO') || raw.includes('AZUL')) {
    return '<span class="severity-badge" style="background:#2563eb;color:white;">B (AZUL)</span>';
  }
  if (raw.includes('C1') || raw.includes('C5') || raw.includes('C2') || raw.includes('RETINÓIDE')) {
    return '<span class="severity-badge" style="background:#d97706;color:white;">C (ESPECIAL)</span>';
  }
  if (raw.includes('ANTIMICROBIANO') || raw.includes('ATM')) {
    return '<span class="severity-badge" style="background:#7c3aed;color:white;">ANTIMICROBIANO</span>';
  }

  return '<span class="severity-badge" style="background:#059669;color:white;">LIVRE</span>';
}

// ──────────────────────────────────────
// Init — Event Listeners
// ──────────────────────────────────────

export async function init() {
  regras = await getReceitasRegras();

  if (!selectedRegra) {
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

function bindTypeSelection() {
  const list = document.getElementById('receitas-type-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const card = e.target.closest('[data-type-index]');
    if (!card) return;

    const index = parseInt(card.dataset.typeIndex, 10);
    selectedRegra = regras[index];
    checkedItems.clear();

    const content = document.getElementById('module-content');
    if (content) {
      content.innerHTML = renderChecklist();
      if (window.lucide) lucide.createIcons();
      bindChecklist();
    }
  });
}

function bindChecklist() {
  const checklistEl = document.getElementById('receitas-checklist');
  const backBtn = document.getElementById('receitas-back-btn');
  const checkAllBtn = document.getElementById('receitas-check-all');
  const resetBtn = document.getElementById('receitas-reset');

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

  if (checkAllBtn) {
    checkAllBtn.addEventListener('click', () => {
      if (!selectedRegra) return;
      const items = selectedRegra.itensObrigatorios || [];
      if (checkedItems.size === items.length) return;

      items.forEach((_, i) => checkedItems.add(i));
      refreshChecklist();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      checkedItems.clear();
      refreshChecklist();
    });
  }
}

function refreshChecklist() {
  const content = document.getElementById('module-content');
  if (content) {
    content.innerHTML = renderChecklist();
    if (window.lucide) lucide.createIcons();
    bindChecklist();
  }
}

export function destroy() {
  selectedRegra = null;
  checkedItems.clear();
  regras = [];
}
