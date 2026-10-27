// ========================================
// FarmaApp — Interações Medicamentosas Module
// ========================================

import { checkInteracoes, getAllInteracoes } from '../../db/database.js';

let selectedDrugs = [];
let detectedInteractions = [];

const COMMON_DRUGS = [
  'Varfarina',
  'Ibuprofeno',
  'Diclofenaco',
  'Fluoxetina',
  'Sertralina',
  'Escitalopram',
  'Tramadol',
  'Clonazepam',
  'Diazepam',
  'Metformina',
  'Omeprazol',
  'Pantoprazol',
  'Sinvastatina',
  'Amiodarona',
  'Enalapril',
  'Losartana',
  'Espironolactona',
  'Ciprofloxacino',
  'Amoxicilina + Clavulanato',
  'Fluconazol',
  'Levotiroxina',
  'Carbonato de Cálcio',
  'Sulfato Ferroso',
  'Digoxina',
  'Ciclobenzaprina'
];

export function render() {
  const selectedPillsHtml = selectedDrugs.map((drug, index) => /* html */ `
    <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm animate-fade-in">
      ${drug}
      <button type="button" class="text-emerald-600 hover:text-emerald-900 focus:outline-none" data-remove-index="${index}" aria-label="Remover ${drug}">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </span>
  `).join('');

  const quickTagsHtml = COMMON_DRUGS
    .filter(drug => !selectedDrugs.includes(drug))
    .slice(0, 12)
    .map(drug => /* html */ `
      <button type="button" class="quick-drug-btn text-xs bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 active:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all" data-add-drug="${drug}">
        + ${drug}
      </button>
    `).join('');

  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Title & Info -->
      <div class="animate-fade-in">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
          Checador de Interações Medicamentosas
        </h2>
        <p class="text-xs text-gray-500 mt-1">Selecione 2 ou mais medicamentos para avaliar potenciais interações clínicas.</p>
      </div>

      <!-- Drug Input Form -->
      <div class="pharma-card space-y-3 animate-fade-in">
        <label class="block text-xs font-semibold text-gray-700">Adicionar Medicamento / Princípio Ativo</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="interacao-input" 
              class="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" 
              placeholder="Ex: Varfarina, Ibuprofeno..." 
              autocomplete="off"
            />
          </div>
          <button id="interacao-add-btn" class="bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center gap-1 shadow-sm">
            <i data-lucide="plus" class="w-4 h-4"></i> Adicionar
          </button>
        </div>

        <!-- Quick selection chips -->
        <div>
          <span class="text-[0.7rem] uppercase tracking-wider text-gray-400 font-semibold block mb-1.5">Frequentes no balcão:</span>
          <div class="flex flex-wrap gap-1.5" id="quick-tags-container">
            ${quickTagsHtml}
          </div>
        </div>
      </div>

      <!-- Selected Drugs Container -->
      <div class="pharma-card animate-fade-in space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-700">Medicamentos Selecionados (${selectedDrugs.length})</span>
          ${selectedDrugs.length > 0 ? /* html */ `
            <button id="clear-all-drugs" class="text-xs text-red-500 font-medium hover:underline">Limpar lista</button>
          ` : ''}
        </div>

        <div class="flex flex-wrap gap-2 pt-1 min-h-[36px] items-center">
          ${selectedDrugs.length === 0 ? /* html */ `
            <span class="text-xs text-gray-400 italic">Nenhum medicamento adicionado ainda.</span>
          ` : selectedPillsHtml}
        </div>
      </div>

      <!-- Results Area -->
      <div class="space-y-3" id="interacoes-results">
        ${renderInteractionResults()}
      </div>
    </div>
  `;
}

function renderInteractionResults() {
  if (selectedDrugs.length < 2) {
    return /* html */ `
      <div class="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
        <i data-lucide="layers" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
        <p class="text-xs text-gray-500 font-medium">Adicione ao menos 2 medicamentos para verificar interações.</p>
      </div>
    `;
  }

  if (detectedInteractions.length === 0) {
    return /* html */ `
      <div class="result-banner result-banner--ok animate-slide-up">
        <i data-lucide="shield-check" class="w-6 h-6 flex-shrink-0 text-emerald-600"></i>
        <div>
          <div class="font-bold text-sm">Nenhuma interação grave/moderada detectada</div>
          <div class="text-xs text-emerald-700 font-normal mt-0.5">Entre os medicamentos cadastrados na base local, não constam alertas críticos para essa combinação.</div>
        </div>
      </div>
    `;
  }

  const cardsHtml = detectedInteractions.map((item, idx) => {
    let sevColor = 'text-red-700 bg-red-100 border-red-300';
    let sevBadge = 'bg-red-600 text-white';
    let sevTitle = 'GRAVE / ALTO RISCO';
    let iconName = 'alert-octagon';

    if (item.severidade === 'moderada') {
      sevColor = 'text-amber-800 bg-amber-50 border-amber-200';
      sevBadge = 'bg-amber-500 text-white';
      sevTitle = 'MODERADA';
      iconName = 'alert-triangle';
    } else if (item.severidade === 'leve') {
      sevColor = 'text-blue-800 bg-blue-50 border-blue-200';
      sevBadge = 'bg-blue-600 text-white';
      sevTitle = 'LEVE';
      iconName = 'info';
    }

    return /* html */ `
      <div class="pharma-card border-l-4 ${item.severidade === 'grave' ? 'border-red-600' : item.severidade === 'moderada' ? 'border-amber-500' : 'border-blue-500'} animate-fade-in space-y-3" style="animation-delay: ${idx * 0.05}s">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${sevBadge}">
              ${sevTitle}
            </span>
          </div>
          <span class="text-[0.7rem] text-gray-400 font-semibold">Evidência: ${item.evidencia || 'Alta'}</span>
        </div>

        <div class="bg-gray-50 rounded-lg p-2.5 text-xs font-bold text-gray-800 flex items-center gap-2">
          <span class="text-emerald-700 font-semibold">${item.med1}</span>
          <i data-lucide="arrow-left-right" class="w-3.5 h-3.5 text-gray-400"></i>
          <span class="text-emerald-700 font-semibold">${item.med2}</span>
        </div>

        <div>
          <h4 class="text-xs font-bold text-gray-800">Efeito Clínico:</h4>
          <p class="text-xs text-gray-600 mt-0.5 leading-relaxed">${item.descricao}</p>
        </div>

        ${item.mecanismo ? /* html */ `
          <div>
            <h4 class="text-xs font-bold text-gray-800">Mecanismo Farmacológico:</h4>
            <p class="text-xs text-gray-600 mt-0.5 leading-relaxed">${item.mecanismo}</p>
          </div>
        ` : ''}

        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <h4 class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
            Conduta / Orientação Farmacêutica:
          </h4>
          <p class="text-xs text-emerald-800 mt-1 font-medium leading-relaxed">${item.recomendacao}</p>
        </div>
      </div>
    `;
  }).join('');

  return /* html */ `
    <div class="space-y-3 animate-fade-in">
      <div class="flex items-center justify-between text-xs font-bold text-gray-700">
        <span>Interações Identificadas (${detectedInteractions.length})</span>
      </div>
      ${cardsHtml}
    </div>
  `;
}

export async function init() {
  bindEvents();
  if (selectedDrugs.length >= 2) {
    await updateInteractions();
  }
}

function bindEvents() {
  const input = document.getElementById('interacao-input');
  const addBtn = document.getElementById('interacao-add-btn');
  const quickContainer = document.getElementById('quick-tags-container');
  const clearBtn = document.getElementById('clear-all-drugs');

  if (addBtn && input) {
    addBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (val && !selectedDrugs.includes(val)) {
        selectedDrugs.push(val);
        input.value = '';
        refreshUI();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addBtn.click();
      }
    });
  }

  if (quickContainer) {
    quickContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-drug]');
      if (!btn) return;
      const drug = btn.dataset.addDrug;
      if (drug && !selectedDrugs.includes(drug)) {
        selectedDrugs.push(drug);
        refreshUI();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      selectedDrugs = [];
      detectedInteractions = [];
      refreshUI();
    });
  }

  const appContent = document.getElementById('module-content');
  if (appContent) {
    appContent.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-index]');
      if (removeBtn) {
        const idx = parseInt(removeBtn.dataset.removeIndex, 10);
        selectedDrugs.splice(idx, 1);
        refreshUI();
      }
    });
  }
}

async function updateInteractions() {
  if (selectedDrugs.length >= 2) {
    detectedInteractions = await checkInteracoes(selectedDrugs);
  } else {
    detectedInteractions = [];
  }
}

async function refreshUI() {
  await updateInteractions();
  const content = document.getElementById('module-content');
  if (content) {
    content.innerHTML = render();
    if (window.lucide) lucide.createIcons();
    bindEvents();
  }
}

export function destroy() {
  selectedDrugs = [];
  detectedInteractions = [];
}
