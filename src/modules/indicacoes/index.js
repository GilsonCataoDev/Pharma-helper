// ========================================
// FarmaApp — Indicações Terapêuticas & MIPs
// ========================================

let selectedCategory = 'todas';
let searchQuery = '';

const GUIA_INDICACOES = [
  {
    sintoma: 'Dor de Cabeça / Cefaleia Tensional',
    categoria: 'dor',
    descricao: 'Dor em aperto ou peso bilateral de intensidade leve a moderada, sem náuseas intensas ou fotofobia severa.',
    redFlags: 'Cefaleia súbita e explosiva ("pior dor da vida"), rigidez de nuca, febre alta com confusão mental, déficit neurológico motor ou após trauma craniano recente.',
    opcoes: [
      {
        nome: 'Dipirona 500mg a 1g',
        posologia: 'Tomar 1 comprimido a cada 6 horas se dor (máx. 4g/dia).',
        dica: 'Ação rápida. Em gotas: 20 a 40 gotas.'
      },
      {
        nome: 'Paracetamol 750mg',
        posologia: 'Tomar 1 comprimido a cada 6 horas (máx. 3g a 4g/dia).',
        dica: 'Opção segura para gestantes e pacientes com histórico de gastrite.'
      },
      {
        nome: 'Neosaldina (Dipirona + Isometepteno + Cafeína)',
        posologia: '1 a 2 drágeas a cada 6 horas.',
        dica: 'Isometepteno atua como vasoconstritor craniano e a cafeína potencializa a analgesia.'
      }
    ]
  },
  {
    sintoma: 'Dor e Febre em Crianças',
    categoria: 'dor',
    descricao: 'Temperatura axilar > 37,8°C associada a mal-estar ou irritabilidade.',
    redFlags: 'Bebês menores de 3 meses com febre, convulsão febril, manchas vermelhas ou roxas na pele que não somem ao pressionar, prostração extrema.',
    opcoes: [
      {
        nome: 'Paracetamol Gotas (200mg/mL)',
        posologia: '1 gota por kg de peso da criança a cada 6 horas.',
        dica: 'Pode ser usado desde recém-nascido sob peso adequado.'
      },
      {
        nome: 'Dipirona Gotas (500mg/mL)',
        posologia: '1 gota por kg de peso a cada 6 horas.',
        dica: 'Indicado a partir dos 3 meses de vida (> 5kg).'
      },
      {
        nome: 'Ibuprofeno Gotas (50mg/mL)',
        posologia: '1 a 2 gotas por kg de peso a cada 6 a 8 horas após mamada.',
        dica: 'Indicado a partir dos 6 meses. Contraindicado em suspeita de Dengue!'
      }
    ]
  },
  {
    sintoma: 'Gripe e Resfriado / Congestão Nasal',
    categoria: 'gripe',
    descricao: 'Obstrução nasal, coriza clara, espirros, dor de garganta leve e moleza no corpo.',
    redFlags: 'Falta de ar (dispneia), dor torácica ao respirar, febre alta persistente por mais de 72 horas, secreção amarelada escura com dor facial unilateral por mais de 10 dias.',
    opcoes: [
      {
        nome: 'Lavagem Nasal com Soro Fisiológico 0,9%',
        posologia: 'Aplicar 5mL a 10mL em cada narina com seringa ou spray de alto volume várias vezes ao dia.',
        dica: 'A medida não farmacológica mais eficaz e sem efeitos adversos.'
      },
      {
        nome: 'Antigripal Composto (Paracetamol + Maleato de Clorfeniramina + Fenilefrina)',
        posologia: '1 cápsula ou comprimido a cada 8 horas (máx. 3 ao dia).',
        dica: 'Cuidado em hipertensos descompensados (descongestionantes sistêmicos podem elevar a PA).'
      }
    ]
  },
  {
    sintoma: 'Tosse Produtiva (Com Muco / Catarro)',
    categoria: 'tosse',
    descricao: 'Tosse com expectoração e acúmulo de secreção traqueobrônquica.',
    redFlags: 'Escarro com sangue (hemoptise), chiado no peito (estridor/sibilância), febre persistente e perda de peso acentuada.',
    opcoes: [
      {
        nome: 'Acetilcisteína 600mg sachê',
        posologia: 'Diluir 1 sachê em meio copo de água uma vez ao dia à noite.',
        dica: 'Mucolítico que fluidifica o muco. Recomendar alta ingestão hídrica!'
      },
      {
        nome: 'Ambroxol Xarope (30mg/5mL adulto / 15mg/5mL pediátrico)',
        posologia: 'Adulto: 5mL 3 vezes ao dia após as refeições.',
        dica: 'Aumenta a síntese de surfactante e reduz a adesividade do catarro.'
      },
      {
        nome: 'Guaifenesina Xarope',
        posologia: 'Adulto: 10mL a 15mL a cada 4 horas.',
        dica: 'Expectorante que estimula a eliminação da secreção.'
      }
    ]
  },
  {
    sintoma: 'Tosse Seca Irritativa (Sem Catarro)',
    categoria: 'tosse',
    descricao: 'Tosse seca e contínua, geralmente após infecção viral ou irritação de vias aéreas.',
    redFlags: 'Uso de anti-hipertensivo IECA (Enalapril/Captopril) como causa, tosse há mais de 3 semanas, tosse noturna que desperta com falta de ar.',
    opcoes: [
      {
        nome: 'Dropropizina Xarope (3mg/mL)',
        posologia: 'Adulto: 10mL até 4 vezes ao dia.',
        dica: 'Ação antitussígena periférica sem causar dependência ou depressão do SNC.'
      },
      {
        nome: 'Cloperastina ou Levodropropizina',
        posologia: 'Conforme posologia da embalagem.',
        dica: 'Inibe o reflexo de tosse no trato respiratório.'
      }
    ]
  },
  {
    sintoma: 'Azia, Queimação e Má Digestão (Dispepsia)',
    categoria: 'digestao',
    descricao: 'Pirose retroesternal após alimentação pesada ou rica em gorduras.',
    redFlags: 'Dor no peito irradiando para o braço esquerdo ou mandíbula (suspeita coronariana!), vômito em borra de café ou fezes escuras pretas (melena), disfagia (dificuldade de engolir).',
    opcoes: [
      {
        nome: 'Hidróxido de Alumínio + Magnésio + Simeticona (Antiácido)',
        posologia: 'Tomar 10mL a 20mL ou mastigar 1 a 2 comprimidos 30 a 60 minutos após refeição.',
        dica: 'Alívio imediato no estômago por neutralização química direta do ácido clorídrico.'
      },
      {
        nome: 'Omeprazol 20mg cápsula',
        posologia: '1 cápsula ao dia pela manhã em jejum, 30 minutos antes do café da manhã.',
        dica: 'Para sintomas recorrentes. Recomenda-se uso por 14 dias.'
      },
      {
        nome: 'Simeticona 75mg/mL Gotas ou 125mg cápsula',
        posologia: '1 cápsula após refeição se houver sensação de estômago estufado ou gases.',
        dica: 'Ação mecânica desfazendo as bolhas de gás.'
      }
    ]
  },
  {
    sintoma: 'Cólica Abdominal e Cólica Menstrual (Dismenorreia)',
    categoria: 'colica',
    descricao: 'Espasmos dolorosos em pontada na região abdominal ou baixo ventre durante o ciclo menstrual.',
    redFlags: 'Abdome rígido em tábua (abdome agudo), dor intensa na fossa ilíaca direita (suspeita de apendicite), atraso menstrual com teste positivo e dor súbita (suspeita de gravidez ectópica).',
    opcoes: [
      {
        nome: 'Buscopan Composto (Escopolamina 10mg + Dipirona 250mg)',
        posologia: '1 a 2 comprimidos até 3 vezes ao dia.',
        dica: 'Ação antiespasmódica na musculatura lisa combinada com analgesia potente.'
      },
      {
        nome: 'Ibuprofeno 400mg ou 600mg',
        posologia: '1 comprimido a cada 8 horas com alimento.',
        dica: 'Primeira escolha comprovada na dismenorreia primária (inibe a síntese de prostaglandinas uterinas).'
      },
      {
        nome: 'Ácido Mefenâmico (Ponstan) 500mg',
        posologia: '1 comprimido a cada 8 horas durante o período de maior fluxo/dor.',
        dica: 'Muito eficaz na dor menstrual intensa.'
      }
    ]
  },
  {
    sintoma: 'Rinite Alérgica (Coriza, Espirros e Coceira)',
    categoria: 'alergia',
    descricao: 'Crise de prurido nasal e ocular, espirros em salva e coriza fluida transparente após contato com poeira, pólen ou ácaros.',
    redFlags: 'Edema de lábios, língua ou glote com sensação de asfixia (choque anafilático - emergência 192 imediata!), chiado intenso no peito.',
    opcoes: [
      {
        nome: 'Loratadina 10mg',
        posologia: '1 comprimido ao dia pela manhã.',
        dica: 'Anti-histamínico de 2ª geração com menor sonolência.'
      },
      {
        nome: 'Desloratadina 5mg ou Fexofenadina 120/180mg',
        posologia: '1 comprimido ao dia.',
        dica: 'Não ultrapassa a barreira hematoencefálica, sem efeito sedativo.'
      },
      {
        nome: 'Budesonida Spray Nasal 32mcg ou 50mcg',
        posologia: '1 a 2 jatos em cada narina uma vez ao dia.',
        dica: 'Corticosteroide tópico de ação anti-inflamatória local prolongada para rinite crônica.'
      }
    ]
  },
  {
    sintoma: 'Diarreia Aguda e Desidratação',
    categoria: 'digestao',
    descricao: 'Aumento da frequência de evacuações líquidas sem sangue ou pus.',
    redFlags: 'Fezes com sangue vivo ou muco abundante, febre acima de 38,5°C, sinais de desidratação grave (olhos encovados, ausência de urina, boca seca, letargia), diarreia há mais de 5 dias.',
    opcoes: [
      {
        nome: 'Sais de Reidratação Oral (SRO - Sachê OMS)',
        posologia: 'Dissolver 1 sachê em exatamente 1 litro de água tratada/fervida e beber aos goles após cada evacuação líquida.',
        dica: 'O pilar essencial que previne a desidratação e salva vidas!'
      },
      {
        nome: 'Probiótico (Saccharomyces boulardii / Lactobacillus)',
        posologia: '1 cápsula ou sachê 1 a 2 vezes ao dia com água.',
        dica: 'Ajuda a restaurar a microbiota intestinal e reduz o tempo da diarreia.'
      },
      {
        nome: 'Racecadotrila 100mg cápsula',
        posologia: '1 cápsula a cada 8 horas (máx. 7 dias).',
        dica: 'Inibidor de encefalinase que reduz a hipersecreção de água no intestino sem paralisar o peristaltismo.'
      }
    ]
  }
];

export function render() {
  const filtered = GUIA_INDICACOES.filter(item => {
    const matchCategory = selectedCategory === 'todas' || item.categoria === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      item.sintoma.toLowerCase().includes(q) || 
      item.descricao.toLowerCase().includes(q) ||
      item.opcoes.some(op => op.nome.toLowerCase().includes(q) || op.dica.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  const cardsHtml = filtered.map((item, idx) => {
    const opcoesHtml = item.opcoes.map(op => `
      <div class="bg-gray-50 border border-gray-100 rounded-xl p-2.5 space-y-1">
        <div class="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
          <i data-lucide="pill" class="w-3.5 h-3.5 text-emerald-600"></i>
          ${op.nome}
        </div>
        <div class="text-[0.7rem] text-gray-700 font-medium"><strong>Posologia usual:</strong> ${op.posologia}</div>
        <div class="text-[0.65rem] text-gray-500 italic">💡 ${op.dica}</div>
      </div>
    `).join('');

    return /* html */ `
      <div class="pharma-card space-y-3 animate-fade-in" style="animation-delay: ${idx * 0.05}s">
        <div class="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
          <div>
            <span class="text-[0.65rem] uppercase tracking-wider font-extrabold text-emerald-600">Queixa / Condição</span>
            <h3 class="font-bold text-sm text-gray-900 mt-0.5">${item.sintoma}</h3>
          </div>
          <span class="info-badge info-badge--green text-[0.65rem] font-bold uppercase">${item.categoria}</span>
        </div>

        <p class="text-xs text-gray-600 leading-relaxed">${item.descricao}</p>

        <!-- Red Flags alert box -->
        <div class="bg-red-50 border border-red-200 rounded-xl p-2.5 text-red-900 space-y-1">
          <div class="text-[0.7rem] font-extrabold flex items-center gap-1.5 text-red-800">
            <i data-lucide="alert-octagon" class="w-4 h-4 text-red-600 flex-shrink-0"></i>
            Sinais de Alerta (Encaminhar ao Médico Imediatamente):
          </div>
          <p class="text-[0.65rem] text-red-700 leading-relaxed font-medium">${item.redFlags}</p>
        </div>

        <!-- Options list -->
        <div class="space-y-2 pt-1">
          <span class="text-[0.7rem] font-bold text-gray-700 uppercase tracking-wider block">Opções Farmacêuticas MIPs Sugeridas:</span>
          ${opcoesHtml}
        </div>
      </div>
    `;
  }).join('');

  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Title -->
      <div class="animate-fade-in">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <i data-lucide="stethoscope" class="w-5 h-5 text-emerald-600"></i>
          Guia de Indicações & Balcão (MIPs)
        </h2>
        <p class="text-xs text-gray-500 mt-0.5">Condutas seguras por sintoma, posologias usuais e sinais de alerta médico.</p>
      </div>

      <!-- Search input -->
      <div class="pharma-card p-3 animate-fade-in">
        <div class="relative">
          <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
          <input 
            type="text" 
            id="ind-search" 
            value="${searchQuery}" 
            placeholder="Buscar por sintoma, queixa ou remédio..." 
            class="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-emerald-600" 
          />
        </div>
      </div>

      <!-- Filter chips -->
      <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 animate-fade-in" id="ind-category-chips">
        <button class="filter-chip ${selectedCategory === 'todas' ? 'active' : ''}" data-cat="todas">Todas</button>
        <button class="filter-chip ${selectedCategory === 'dor' ? 'active' : ''}" data-cat="dor">🤕 Dor & Febre</button>
        <button class="filter-chip ${selectedCategory === 'gripe' ? 'active' : ''}" data-cat="gripe">🤧 Gripe & Coriza</button>
        <button class="filter-chip ${selectedCategory === 'tosse' ? 'active' : ''}" data-cat="tosse">🫁 Tosse</button>
        <button class="filter-chip ${selectedCategory === 'digestao' ? 'active' : ''}" data-cat="digestao">🤢 Azia & Diarreia</button>
        <button class="filter-chip ${selectedCategory === 'colica' ? 'active' : ''}" data-cat="colica">⚡ Cólicas</button>
        <button class="filter-chip ${selectedCategory === 'alergia' ? 'active' : ''}" data-cat="alergia">🌸 Alergias</button>
      </div>

      <!-- Results list -->
      <div class="space-y-3.5">
        ${filtered.length > 0 ? cardsHtml : /* html */ `
          <div class="text-center py-10 bg-gray-50 rounded-xl p-4">
            <i data-lucide="search-x" class="w-10 h-10 text-gray-300 mx-auto mb-2"></i>
            <p class="text-xs text-gray-500 font-medium">Nenhuma recomendação encontrada para a busca.</p>
          </div>
        `}
      </div>
    </div>
  `;
}

export function init() {
  bindEvents();
}

function bindEvents() {
  const searchInput = document.getElementById('ind-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      refreshUI();
    });
  }

  const chipsContainer = document.getElementById('ind-category-chips');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat]');
      if (!chip) return;
      selectedCategory = chip.dataset.cat;
      refreshUI();
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
  searchQuery = '';
}
