// ========================================
// FarmaApp — Home Module
// ========================================

import * as SearchBar from '../../components/SearchBar.js';

/**
 * Module cards for the home screen.
 */
const MODULES = [
  {
    id: 'receitas',
    hash: '#/receitas',
    icon: 'clipboard-check',
    title: 'Checagem de Receitas',
    description: 'Requisitos legais, retenção e validade de receitas',
    available: true,
    color: 'bg-emerald-50 text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'equivalencia',
    hash: '#/equivalencia',
    icon: 'pill',
    title: 'Equivalência',
    description: 'Consulte genéricos, similares e referência',
    available: true,
    color: 'bg-blue-50 text-blue-700',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'interacoes',
    hash: '#/interacoes',
    icon: 'alert-triangle',
    title: 'Interações',
    description: 'Checador rápido de interações medicamentosas',
    available: true,
    color: 'bg-amber-50 text-amber-700',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'calculadora',
    hash: '#/calculadora',
    icon: 'calculator',
    title: 'Calculadora',
    description: 'Doses pediátricas, conversão de gotas e diluições',
    available: true,
    color: 'bg-cyan-50 text-cyan-700',
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
  {
    id: 'pedidos',
    hash: '#/pedidos',
    icon: 'package-check',
    title: 'Pedidos & Baixas',
    description: 'Conferência de notas, lotes e validades',
    available: true,
    color: 'bg-purple-50 text-purple-700',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'indicacoes',
    hash: '#/indicacoes',
    icon: 'stethoscope',
    title: 'Indicações MIPs',
    description: 'Guia por queixa/sintoma e sinais de alerta',
    available: true,
    color: 'bg-rose-50 text-rose-700',
    iconBg: 'bg-rose-100 text-rose-700',
  },
];

/**
 * Renders the home screen.
 * @returns {string} HTML string.
 */
export function render() {
  const searchHtml = SearchBar.render({
    placeholder: 'Buscar módulo no FarmaApp...',
    id: 'home-search',
  });

  const cardsHtml = MODULES.map((mod, i) => {
    return /* html */ `
      <a href="${mod.hash}"
         class="pharma-card pharma-card--clickable relative stagger-item animate-fade-in flex flex-col justify-between"
         style="opacity: 0; animation-delay: ${i * 0.05}s;"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="${mod.iconBg} rounded-xl p-2.5 flex-shrink-0">
              <i data-lucide="${mod.icon}" class="w-5 h-5"></i>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-gray-300"></i>
          </div>
          <h3 class="font-bold text-sm text-gray-800 leading-tight">${mod.title}</h3>
          <p class="text-[0.7rem] text-gray-500 mt-1 leading-relaxed">${mod.description}</p>
        </div>
      </a>
    `;
  }).join('');

  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Welcome Header -->
      <div class="animate-fade-in bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Assistente Farmacêutico</span>
            <h2 class="text-lg font-extrabold mt-0.5">Olá, Colega! 💊</h2>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <i data-lucide="activity" class="w-6 h-6 text-white"></i>
          </div>
        </div>
        <p class="text-xs text-emerald-100 mt-2">Ferramenta rápida para agilizar receitas, doses, interações e conferências no balcão.</p>
      </div>

      <!-- Search -->
      <div class="animate-fade-in" style="animation-delay: 0.05s;">
        ${searchHtml}
      </div>

      <!-- Quick Access Title -->
      <div class="flex items-center justify-between pt-1">
        <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-700">Módulos de Trabalho</h3>
        <span class="text-[0.65rem] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">100% Offline</span>
      </div>

      <!-- Module Cards Grid -->
      <div class="grid grid-cols-2 gap-3" id="home-modules-grid">
        ${cardsHtml}
      </div>

      <!-- Legal Disclaimer card -->
      <div class="p-3 bg-gray-100/70 border border-gray-200/60 rounded-xl text-[0.65rem] text-gray-500 leading-normal">
        <strong>Aviso Profissional:</strong> Aplicativo de suporte e consulta rápida. Não substitui o raciocínio clínico e a responsabilidade técnica do Farmacêutico (Lei 13.021/14 e RDC 44/09).
      </div>
    </div>
  `;
}

/**
 * Initialize home screen event listeners.
 */
export function init() {
  SearchBar.init('home-search', 150, (query) => {
    const grid = document.getElementById('home-modules-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.pharma-card');
    cards.forEach((card, i) => {
      const mod = MODULES[i];
      const text = `${mod.title} ${mod.description}`.toLowerCase();
      card.style.display = text.includes(query) || !query ? '' : 'none';
    });
  });
}
