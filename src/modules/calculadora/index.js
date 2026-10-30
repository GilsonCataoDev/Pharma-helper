// ========================================
// FarmaApp — Calculadora Farmacêutica Module
// ========================================

let activeTab = 'pediatrica'; // 'pediatrica' | 'gotas' | 'diluicao'

// Calculation states
let pedState = {
  preset: 'dipirona_500',
  peso: 15,
  customDoseMgKg: 10,
  customConcMg: 250,
  customConcMl: 5,
  customFreq: 8
};

let gotasState = {
  mlInput: 1,
  gotasInput: 20
};

let dilState = {
  c1: 10,
  v1: 100,
  c2: 2
};

const PEDIATRIC_PRESETS = {
  'dipirona_500': {
    nome: 'Dipirona Gotas (500mg/mL)',
    tipo: 'gotas',
    calc: (peso) => {
      const gotas = Math.round(peso * 1);
      const mg = (gotas / 20) * 500;
      return {
        resultado: `${gotas} gotas`,
        detalhe: `${mg.toFixed(0)}mg por tomada`,
        frequencia: 'A cada 6 horas se febre ou dor (máx. 4x ao dia)',
        aviso: 'Dose padrão usual no Brasil: 1 gota por kg de peso (máx. 35 a 40 gotas em crianças).'
      };
    }
  },
  'paracetamol_200': {
    nome: 'Paracetamol Gotas (200mg/mL)',
    tipo: 'gotas',
    calc: (peso) => {
      const gotas = Math.round(peso * 1);
      const mg = (gotas / 20) * 200;
      return {
        resultado: `${gotas} gotas`,
        detalhe: `${mg.toFixed(0)}mg por tomada (10-15 mg/kg)`,
        frequencia: 'A cada 4 a 6 horas (máx. 5 tomadas em 24h)',
        aviso: 'Dose máxima diária pediátrica recomendada: 75 mg/kg/dia.'
      };
    }
  },
  'paracetamol_100_bebe': {
    nome: 'Paracetamol Bebê (100mg/mL)',
    tipo: 'gotas',
    calc: (peso) => {
      // 1 gota para cada 0.7kg aprox (15mg/kg)
      const ml = (peso * 12) / 100;
      const gotas = Math.round(ml * 20);
      return {
        resultado: `${ml.toFixed(1)} mL (${gotas} gotas)`,
        detalhe: `${(peso * 12).toFixed(0)}mg por tomada`,
        frequencia: 'A cada 6 horas',
        aviso: 'Acompanha seringa dosadora para maior precisão em bebês.'
      };
    }
  },
  'ibuprofeno_50': {
    nome: 'Ibuprofeno Gotas 50mg/mL',
    tipo: 'gotas',
    calc: (peso) => {
      const gotasMin = Math.round(peso * 1);
      const gotasMax = Math.round(peso * 2);
      return {
        resultado: `${gotasMin} a ${gotasMax} gotas`,
        detalhe: `${(peso * 5).toFixed(0)}mg a ${(peso * 10).toFixed(0)}mg por dose`,
        frequencia: 'A cada 6 a 8 horas (após mamada ou refeição)',
        aviso: '1 a 2 gotas por kg. Contraindicado em menores de 6 meses sem indicação médica.'
      };
    }
  },
  'ibuprofeno_100': {
    nome: 'Ibuprofeno Gotas 100mg/mL (Alivium)',
    tipo: 'gotas',
    calc: (peso) => {
      const gotas = Math.round(peso / 2);
      return {
        resultado: `${gotas} gotas`,
        detalhe: `${(peso * 5).toFixed(0)}mg por tomada (dose mínima 5mg/kg)`,
        frequencia: 'A cada 6 a 8 horas',
        aviso: 'Atenção à concentração dobrada (100mg/mL). 1 gota para cada 2 kg de peso.'
      };
    }
  },
  'amoxicilina_250': {
    nome: 'Amoxicilina Suspensão 250mg/5mL',
    tipo: 'ml',
    calc: (peso) => {
      // 50 mg/kg/dia dividido em 3 tomadas (a cada 8 horas)
      const mgDia = peso * 50;
      const mgDose = mgDia / 3;
      const mlDose = (mgDose * 5) / 250;
      return {
        resultado: `${mlDose.toFixed(1)} mL`,
        detalhe: `${mgDose.toFixed(0)}mg por tomada (total: ${mgDia.toFixed(0)}mg/dia)`,
        frequencia: 'A cada 8 horas por 7 a 10 dias',
        aviso: 'Medir com a seringa ou copo-medida. Manter suspensão refrigerada conforme bula.'
      };
    }
  },
  'amoxicilina_500': {
    nome: 'Amoxicilina Suspensão 500mg/5mL',
    tipo: 'ml',
    calc: (peso) => {
      const mgDia = peso * 50;
      const mgDose = mgDia / 3;
      const mlDose = (mgDose * 5) / 500;
      return {
        resultado: `${mlDose.toFixed(1)} mL`,
        detalhe: `${mgDose.toFixed(0)}mg por tomada`,
        frequencia: 'A cada 8 horas por 7 a 10 dias',
        aviso: 'Concentração concentrada 500mg/5mL.'
      };
    }
  },
  'azitromicina_200': {
    nome: 'Azitromicina Suspensão 200mg/5mL',
    tipo: 'ml',
    calc: (peso) => {
      // 10 mg/kg/dia dose única diária
      const mgDia = peso * 10;
      const mlDia = (mgDia * 5) / 200;
      return {
        resultado: `${mlDia.toFixed(1)} mL`,
        detalhe: `${mgDia.toFixed(0)}mg em dose única diária`,
        frequencia: '1 vez ao dia por 3 a 5 dias consecutivos',
        aviso: 'Administrar 1 hora antes ou 2 horas após a refeição.'
      };
    }
  }
};

export function render() {
  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Title -->
      <div class="animate-fade-in">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <i data-lucide="calculator" class="w-5 h-5 text-emerald-600"></i>
          Calculadora Farmacêutica
        </h2>
        <p class="text-xs text-gray-500 mt-1">Cálculos de doses pediátricas, conversão de gotas e diluições para balcão.</p>
      </div>

      <!-- Navigation Segment Tabs -->
      <div class="flex bg-gray-200 p-1 rounded-xl animate-fade-in text-xs font-semibold">
        <button class="flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'pediatrica' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}" data-calc-tab="pediatrica">
          👶 Dose Pediátrica
        </button>
        <button class="flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'gotas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}" data-calc-tab="gotas">
          💧 Gotas ↔ mL
        </button>
        <button class="flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'diluicao' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}" data-calc-tab="diluicao">
          🧪 Diluição (C1×V1)
        </button>
      </div>

      <!-- Tab Content -->
      <div id="calc-tab-content" class="animate-fade-in">
        ${renderActiveTabContent()}
      </div>
    </div>
  `;
}

function renderActiveTabContent() {
  if (activeTab === 'pediatrica') {
    return renderPediatricaTab();
  } else if (activeTab === 'gotas') {
    return renderGotasTab();
  } else {
    return renderDiluicaoTab();
  }
}

function renderPediatricaTab() {
  const presetConfig = PEDIATRIC_PRESETS[pedState.preset];
  const calcResult = presetConfig ? presetConfig.calc(pedState.peso) : null;

  const presetOptionsHtml = Object.entries(PEDIATRIC_PRESETS).map(([key, item]) => `
    <option value="${key}" ${pedState.preset === key ? 'selected' : ''}>${item.nome}</option>
  `).join('');

  return /* html */ `
    <div class="space-y-4">
      <div class="pharma-card space-y-3">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Medicamento / Apresentação</label>
          <select id="ped-preset" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium text-gray-800 outline-none focus:border-emerald-600">
            ${presetOptionsHtml}
          </select>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-semibold text-gray-700">Peso da Criança (kg)</label>
            <span class="text-sm font-bold text-emerald-700" id="peso-display">${pedState.peso} kg</span>
          </div>
          <div class="flex items-center gap-3">
            <input 
              type="range" 
              id="ped-peso-range" 
              min="2" 
              max="60" 
              step="0.5" 
              value="${pedState.peso}" 
              class="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
            <input 
              type="number" 
              id="ped-peso-input" 
              min="1" 
              max="100" 
              step="0.5" 
              value="${pedState.peso}" 
              class="w-16 text-center text-xs font-bold border border-gray-300 rounded-lg p-2 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Calculation Result Card -->
      ${calcResult ? /* html */ `
        <div class="pharma-card bg-emerald-50 border border-emerald-200 space-y-3 animate-slide-up">
          <div class="flex items-center justify-between">
            <span class="text-[0.7rem] uppercase tracking-wider font-bold text-emerald-700">Dose Calculada</span>
            <span class="info-badge info-badge--green text-xs font-bold">Por tomada</span>
          </div>

          <div class="text-center py-2">
            <div class="text-3xl font-extrabold text-emerald-900">${calcResult.resultado}</div>
            <div class="text-xs font-medium text-emerald-700 mt-1">${calcResult.detalhe}</div>
          </div>

          <div class="bg-white rounded-xl p-3 space-y-2 border border-emerald-100 text-xs">
            <div class="flex items-start gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"></i>
              <span class="text-gray-700"><strong>Posologia:</strong> ${calcResult.frequencia}</span>
            </div>
            <div class="flex items-start gap-2 text-gray-500">
              <i data-lucide="alert-circle" class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"></i>
              <span>${calcResult.aviso}</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Custom Formula section -->
      <div class="pharma-card border border-dashed border-gray-300 text-xs text-gray-600 space-y-2">
        <h4 class="font-bold text-gray-800 flex items-center gap-1.5">
          <i data-lucide="info" class="w-4 h-4 text-emerald-600"></i>
          Fórmula Farmacêutica Utilizada:
        </h4>
        <p class="font-mono bg-gray-50 p-2 rounded text-[0.75rem] text-gray-700">
          mL por dose = (Peso [kg] × Dose [mg/kg]) ÷ Concentração [mg/mL]
        </p>
        <p class="text-[0.7rem] text-gray-400">
          Nota: Em pediatria, sempre confira a dosagem máxima com a prescrição médica e os dados da bula oficial aprovada pela ANVISA.
        </p>
      </div>
    </div>
  `;
}

function renderGotasTab() {
  const gotasFromMl = Math.round(gotasState.mlInput * 20);
  const mlFromGotas = (gotasState.gotasInput / 20).toFixed(2);

  return /* html */ `
    <div class="space-y-4">
      <div class="pharma-card space-y-4">
        <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Conversão de Volume & Gotas</h3>
        
        <!-- mL to Gotas -->
        <div class="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
          <label class="block text-xs font-semibold text-gray-700">Volume em mL para Gotas:</label>
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <input type="number" step="0.1" min="0" id="conv-ml-input" value="${gotasState.mlInput}" class="w-full text-sm font-bold border border-gray-300 rounded-lg p-2.5 outline-none focus:border-emerald-600" />
              <span class="absolute right-3 top-3 text-xs text-gray-400 font-semibold">mL</span>
            </div>
            <i data-lucide="arrow-right" class="w-5 h-5 text-gray-400"></i>
            <div class="flex-1 bg-white border border-emerald-200 rounded-lg p-2.5 text-center font-extrabold text-emerald-700 text-base">
              ${gotasFromMl} gotas
            </div>
          </div>
        </div>

        <!-- Gotas to mL -->
        <div class="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
          <label class="block text-xs font-semibold text-gray-700">Gotas para mL:</label>
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <input type="number" step="1" min="0" id="conv-gotas-input" value="${gotasState.gotasInput}" class="w-full text-sm font-bold border border-gray-300 rounded-lg p-2.5 outline-none focus:border-emerald-600" />
              <span class="absolute right-3 top-3 text-xs text-gray-400 font-semibold">gotas</span>
            </div>
            <i data-lucide="arrow-right" class="w-5 h-5 text-gray-400"></i>
            <div class="flex-1 bg-white border border-emerald-200 rounded-lg p-2.5 text-center font-extrabold text-emerald-700 text-base">
              ${mlFromGotas} mL
            </div>
          </div>
        </div>
      </div>

      <!-- Reference Box -->
      <div class="pharma-card bg-blue-50 border border-blue-200 space-y-2 text-xs text-blue-900">
        <h4 class="font-bold flex items-center gap-1.5">
          <i data-lucide="droplet" class="w-4 h-4 text-blue-600"></i> Padrão Farmacêutico Usual:
        </h4>
        <ul class="list-disc list-inside space-y-1 text-[0.75rem] text-blue-800">
          <li><strong>1 mL = 20 gotas</strong> (conta-gotas padrão de água/solução aquosa)</li>
          <li><strong>1 gota ≈ 0,05 mL</strong></li>
          <li><strong>1 colher de chá ≈ 5 mL</strong></li>
          <li><strong>1 colher de sobremesa ≈ 10 mL</strong></li>
          <li><strong>1 colher de sopa ≈ 15 mL</strong></li>
        </ul>
      </div>
    </div>
  `;
}

function renderDiluicaoTab() {
  // C1 * V1 = C2 * V2 -> V2 = (C1 * V1) / C2
  const v2 = dilState.c2 > 0 ? (dilState.c1 * dilState.v1) / dilState.c2 : 0;
  const aguaAdicionar = Math.max(0, v2 - dilState.v1);

  return /* html */ `
    <div class="space-y-4">
      <div class="pharma-card space-y-3">
        <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Cálculo de Diluição (C₁ × V₁ = C₂ × V₂)</h3>
        <p class="text-xs text-gray-500">Calcule quanto diluente adicionar para reduzir a concentração de uma solução.</p>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label class="block text-[0.7rem] font-bold text-gray-600 mb-1">Concentração Inicial (C₁)</label>
            <div class="relative">
              <input type="number" id="dil-c1" value="${dilState.c1}" step="0.5" class="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600" />
              <span class="absolute right-2 top-2 text-[0.65rem] text-gray-400 font-bold">% ou mg/mL</span>
            </div>
          </div>
          <div>
            <label class="block text-[0.7rem] font-bold text-gray-600 mb-1">Volume Inicial (V₁)</label>
            <div class="relative">
              <input type="number" id="dil-v1" value="${dilState.v1}" step="10" class="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600" />
              <span class="absolute right-2 top-2 text-[0.65rem] text-gray-400 font-bold">mL</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-[0.7rem] font-bold text-gray-600 mb-1">Concentração Desejada (C₂)</label>
          <div class="relative">
            <input type="number" id="dil-c2" value="${dilState.c2}" step="0.5" class="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 outline-none focus:border-emerald-600" />
            <span class="absolute right-2 top-2 text-[0.65rem] text-gray-400 font-bold">% ou mg/mL</span>
          </div>
        </div>
      </div>

      <!-- Result Card -->
      <div class="pharma-card bg-emerald-50 border border-emerald-200 space-y-2 animate-slide-up">
        <div class="text-[0.7rem] uppercase tracking-wider font-bold text-emerald-800">Resultado da Diluição:</div>
        <div class="flex justify-between items-center py-1">
          <span class="text-xs text-gray-600">Volume Final Total (V₂):</span>
          <span class="text-sm font-black text-emerald-900">${v2.toFixed(1)} mL</span>
        </div>
        <div class="flex justify-between items-center py-1 border-t border-emerald-100">
          <span class="text-xs text-emerald-700 font-bold">Adicionar de Diluente:</span>
          <span class="text-base font-extrabold text-emerald-800">+ ${aguaAdicionar.toFixed(1)} mL</span>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  bindTabEvents();
  bindContentEvents();
}

/**
 * Attach listeners to the tab buttons (outside #calc-tab-content).
 * Called once on init; tabs persist across refreshUI() calls.
 */
function bindTabEvents() {
  const tabs = document.querySelectorAll('[data-calc-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.calcTab;
      // Update active styling without full re-render
      tabs.forEach(t => {
        const isActive = t.dataset.calcTab === activeTab;
        t.className = `flex-1 py-2 text-center rounded-lg transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}`;
      });
      refreshUI();
    });
  });
}

/**
 * Attach listeners to inputs INSIDE the tab content area.
 * Called on init and after each refreshUI().
 */
function bindContentEvents() {
  // Pediatric bindings
  const presetSelect = document.getElementById('ped-preset');
  const pesoRange = document.getElementById('ped-peso-range');
  const pesoInput = document.getElementById('ped-peso-input');

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      pedState.preset = e.target.value;
      refreshUI();
    });
  }

  if (pesoRange && pesoInput) {
    pesoRange.addEventListener('input', (e) => {
      pedState.peso = parseFloat(e.target.value);
      pesoInput.value = pedState.peso;
      refreshUI();
    });

    pesoInput.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v > 0) {
        pedState.peso = v;
        pesoRange.value = v;
        refreshUI();
      }
    });
  }

  // Gotas bindings
  const mlInput = document.getElementById('conv-ml-input');
  const gotasInput = document.getElementById('conv-gotas-input');

  if (mlInput) {
    mlInput.addEventListener('input', (e) => {
      gotasState.mlInput = parseFloat(e.target.value) || 0;
      refreshUI();
    });
  }

  if (gotasInput) {
    gotasInput.addEventListener('input', (e) => {
      gotasState.gotasInput = parseFloat(e.target.value) || 0;
      refreshUI();
    });
  }

  // Dilution bindings
  const c1Input = document.getElementById('dil-c1');
  const v1Input = document.getElementById('dil-v1');
  const c2Input = document.getElementById('dil-c2');

  if (c1Input && v1Input && c2Input) {
    [c1Input, v1Input, c2Input].forEach(inp => {
      inp.addEventListener('input', () => {
        dilState.c1 = parseFloat(c1Input.value) || 0;
        dilState.v1 = parseFloat(v1Input.value) || 0;
        dilState.c2 = parseFloat(c2Input.value) || 0;
        refreshUI();
      });
    });
  }
}

function refreshUI() {
  // Only re-render the tab content, NOT the full module (avoids re-attaching
  // listeners on the tab buttons which live outside #calc-tab-content).
  const tabContent = document.getElementById('calc-tab-content');
  if (tabContent) {
    tabContent.innerHTML = renderActiveTabContent();
    if (window.lucide) lucide.createIcons();
    // Re-bind only the content-level inputs (tabs already have listeners)
    bindContentEvents();
  }
}

export function destroy() {
  // No state reset intentional — keeps calculator values across re-visits
}
