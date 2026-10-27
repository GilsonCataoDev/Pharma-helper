// ========================================
// FarmaApp — Conferência de Pedidos & Baixas
// ========================================

import { getConferencias, addConferencia, deleteConferencia } from '../../db/database.js';

let conferenciasList = [];
let isCreating = false;

// New item draft
let draft = {
  distribuidora: '',
  nf: '',
  medicamento: '',
  lote: '',
  validade: '',
  qtdPedida: 1,
  qtdRecebida: 1,
  embalagemOk: true,
  termolabil: false,
  temperaturaChegada: '',
  controlado: false,
  divergencia: '',
  status: 'Aprovado'
};

export function render() {
  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between animate-fade-in">
        <div>
          <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
            <i data-lucide="package-check" class="w-5 h-5 text-emerald-600"></i>
            Conferência de Pedidos & Baixas
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Checklist de recebimento de distribuidoras, lotes e validades.</p>
        </div>
        <button id="toggle-create-btn" class="text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${isCreating ? 'bg-gray-200 text-gray-700' : 'bg-emerald-600 text-white shadow-sm'}">
          <i data-lucide="${isCreating ? 'x' : 'plus'}" class="w-4 h-4"></i>
          ${isCreating ? 'Fechar' : 'Nova Conferência'}
        </button>
      </div>

      <!-- New Conference Form -->
      ${isCreating ? renderForm() : ''}

      <!-- List of Past Conferences -->
      <div class="space-y-3 animate-fade-in">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-700">Histórico de Recebimentos (${conferenciasList.length})</span>
        </div>

        <div id="conferencias-history" class="space-y-2.5">
          ${renderHistory()}
        </div>
      </div>
    </div>
  `;
}

function renderForm() {
  return /* html */ `
    <form id="conferencia-form" class="pharma-card space-y-3.5 border-2 border-emerald-500/30 animate-slide-up">
      <div class="border-b border-gray-100 pb-2">
        <h3 class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Formulário de Entrada de Mercadoria</h3>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block text-[0.7rem] font-bold text-gray-700 mb-1">Distribuidora *</label>
          <input type="text" id="conf-dist" required placeholder="Ex: Santa Cruz, Profarma..." class="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-emerald-600" />
        </div>
        <div>
          <label class="block text-[0.7rem] font-bold text-gray-700 mb-1">Nota Fiscal / Pedido *</label>
          <input type="text" id="conf-nf" required placeholder="Ex: NF-12849" class="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-emerald-600" />
        </div>
      </div>

      <div>
        <label class="block text-[0.7rem] font-bold text-gray-700 mb-1">Medicamento / Produto *</label>
        <input type="text" id="conf-med" required placeholder="Ex: Amoxicilina 500mg c/ 21 caps EMS" class="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-emerald-600" />
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block text-[0.7rem] font-bold text-gray-700 mb-1">Número do Lote *</label>
          <input type="text" id="conf-lote" required placeholder="Ex: LT4928" class="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-emerald-600 font-mono" />
        </div>
        <div>
          <label class="block text-[0.7rem] font-bold text-gray-700 mb-1">Data de Validade *</label>
          <input type="month" id="conf-validade" required class="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <div>
          <label class="block text-[0.7rem] font-bold text-gray-600 mb-1">Qtd Faturada (NF)</label>
          <input type="number" min="1" id="conf-qtd-ped" value="1" class="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600" />
        </div>
        <div>
          <label class="block text-[0.7rem] font-bold text-gray-600 mb-1">Qtd Física Recebida</label>
          <input type="number" min="0" id="conf-qtd-rec" value="1" class="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600" />
        </div>
      </div>

      <!-- Checklist checkboxes -->
      <div class="space-y-2 pt-1 text-xs">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="conf-emb" checked class="w-4 h-4 accent-emerald-600 rounded" />
          <span class="text-gray-700 font-medium">Embalagens íntegras, sem avarias e com lacre intacto</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="conf-termolabil" class="w-4 h-4 accent-emerald-600 rounded" />
          <span class="text-gray-700 font-medium">Produto Termolábil (Geladeira 2°C a 8°C)</span>
        </label>

        <div id="temp-box" class="hidden pl-6">
          <input type="text" id="conf-temp" placeholder="Temperatura da caixa térmica (Ex: 4.5 °C)" class="w-full text-xs border border-blue-300 bg-blue-50/50 rounded-lg p-2 outline-none" />
        </div>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="conf-controlado" class="w-4 h-4 accent-emerald-600 rounded" />
          <span class="text-gray-700 font-medium">Portaria 344 (Controlado / Psicotrópico)</span>
        </label>
      </div>

      <div>
        <label class="block text-[0.7rem] font-bold text-gray-700 mb-1">Observações ou Divergências (se houver)</label>
        <textarea id="conf-obs" rows="2" placeholder="Ex: 1 caixa amassada; prazo de validade curto (4 meses)..." class="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600"></textarea>
      </div>

      <div class="flex gap-2 pt-2">
        <button type="submit" class="flex-1 bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm">
          Salvar Conferência
        </button>
      </div>
    </form>
  `;
}

function renderHistory() {
  if (conferenciasList.length === 0) {
    return /* html */ `
      <div class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
        <i data-lucide="inbox" class="w-10 h-10 text-gray-300 mx-auto mb-2"></i>
        <p class="text-xs text-gray-500 font-medium">Nenhuma conferência registrada no histórico.</p>
        <p class="text-[0.7rem] text-gray-400 mt-1">Clique em "Nova Conferência" acima para checar uma nota.</p>
      </div>
    `;
  }

  return conferenciasList.map((item, idx) => {
    const isDivergente = item.qtdPedida !== item.qtdRecebida || !item.embalagemOk || (item.observacoes && item.observacoes.length > 0);
    const badgeColor = isDivergente ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
    const statusText = isDivergente ? 'Com Divergência' : 'Conferido OK';

    const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return /* html */ `
      <div class="pharma-card space-y-2.5 animate-fade-in" style="animation-delay: ${idx * 0.04}s">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[0.65rem] uppercase tracking-wider font-extrabold text-gray-400">${item.distribuidora || 'Distribuidora'} • NF: ${item.nf || 'S/N'}</span>
            <h4 class="font-bold text-sm text-gray-800 mt-0.5">${item.medicamento || 'Medicamento'}</h4>
          </div>
          <span class="text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${badgeColor}">
            ${statusText}
          </span>
        </div>

        <div class="flex flex-wrap gap-2 text-[0.7rem] text-gray-600 bg-gray-50 p-2.5 rounded-lg font-medium">
          <div><strong>Lote:</strong> <span class="font-mono text-gray-800">${item.lote || '—'}</span></div>
          <div>• <strong>Validade:</strong> ${item.validade || '—'}</div>
          <div>• <strong>Qtd:</strong> ${item.qtdRecebida} de ${item.qtdPedida} un.</div>
          ${item.termolabil ? '<span class="text-blue-700 font-bold">• ❄️ Termolábil</span>' : ''}
          ${item.controlado ? '<span class="text-amber-700 font-bold">• 🔒 Controlado 344</span>' : ''}
        </div>

        ${item.observacoes ? /* html */ `
          <div class="text-[0.7rem] bg-amber-50/70 border border-amber-200/60 text-amber-900 rounded p-2">
            <strong>Obs / Divergência:</strong> ${item.observacoes}
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-1 border-t border-gray-100 text-[0.65rem] text-gray-400">
          <span>Registrado em: ${dataFormatada}</span>
          <button data-delete-id="${item.id}" class="text-red-500 hover:text-red-700 font-medium">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

export async function init() {
  conferenciasList = await getConferencias();
  bindEvents();
}

function bindEvents() {
  const toggleBtn = document.getElementById('toggle-create-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isCreating = !isCreating;
      refreshUI();
    });
  }

  const form = document.getElementById('conferencia-form');
  if (form) {
    const termolabilCheck = document.getElementById('conf-termolabil');
    const tempBox = document.getElementById('temp-box');

    if (termolabilCheck && tempBox) {
      termolabilCheck.addEventListener('change', (e) => {
        tempBox.classList.toggle('hidden', !e.target.checked);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dist = document.getElementById('conf-dist').value.trim();
      const nf = document.getElementById('conf-nf').value.trim();
      const med = document.getElementById('conf-med').value.trim();
      const lote = document.getElementById('conf-lote').value.trim();
      const validade = document.getElementById('conf-validade').value;
      const qtdPed = parseInt(document.getElementById('conf-qtd-ped').value, 10) || 1;
      const qtdRec = parseInt(document.getElementById('conf-qtd-rec').value, 10) || 1;
      const emb = document.getElementById('conf-emb').checked;
      const termolabil = document.getElementById('conf-termolabil').checked;
      const temp = document.getElementById('conf-temp')?.value.trim() || '';
      const controlado = document.getElementById('conf-controlado').checked;
      const obs = document.getElementById('conf-obs').value.trim();

      await addConferencia({
        distribuidora: dist,
        nf: nf,
        medicamento: med,
        lote: lote,
        validade: validade,
        qtdPedida: qtdPed,
        qtdRecebida: qtdRec,
        embalagemOk: emb,
        termolabil: termolabil,
        temperaturaChegada: temp,
        controlado: controlado,
        observacoes: obs
      });

      isCreating = false;
      conferenciasList = await getConferencias();
      refreshUI();
    });
  }

  const historyEl = document.getElementById('conferencias-history');
  if (historyEl) {
    historyEl.addEventListener('click', async (e) => {
      const delBtn = e.target.closest('[data-delete-id]');
      if (delBtn) {
        const id = parseInt(delBtn.dataset.deleteId, 10);
        if (confirm('Deseja excluir este registro de conferência?')) {
          await deleteConferencia(id);
          conferenciasList = await getConferencias();
          refreshUI();
        }
      }
    });
  }
}

function refreshUI() {
  const content = document.getElementById('module-content');
  if (content) {
    content.innerHTML = render();
    if (window.lucide) lucide.createIcons();
    bindEvents();
  }
}

export function destroy() {
  isCreating = false;
}
