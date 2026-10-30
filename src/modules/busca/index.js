// ========================================
// FarmaApp — Busca Inteligente de Medicamentos
// Integra base local + Gemini AI (gratuito)
// ========================================

import { searchMedicamentos, searchEquivalencias } from '../../db/database.js';

let currentQuery = '';
let localResults = [];
let aiResult = null;
let isLoadingAI = false;
let aiError = null;
let aiDebounceTimer = null;

// ──────────────────────────────────────
// Gemini AI Integration (Free Tier)
// ──────────────────────────────────────

const GEMINI_API_KEY = 'AIzaSyD-9tSrke72WhFra1mjS4your_key_here';
// NOTA: Substitua pela sua chave em https://aistudio.google.com/app/apikey (gratuito)
// A chave acima é placeholder. Sem a chave, o app usa apenas a base local.

async function consultarGeminiAI(medicamento) {
  const apiKey = window.FARMAAPP_GEMINI_KEY || GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your_key_here')) {
    return null; // Sem chave configurada — usa só base local
  }

  const prompt = `Você é um farmacêutico clínico brasileiro especialista. Responda APENAS com JSON válido, sem markdown, sem texto extra.

Para o medicamento/princípio ativo: "${medicamento}"

Retorne este JSON:
{
  "nome": "Nome comercial mais comum (Genérico)",
  "principioAtivo": "Substância ativa",
  "classe": "Classe terapêutica",
  "indicacoes": ["indicação 1", "indicação 2", "indicação 3"],
  "contraindicacoes": ["contraindicação 1", "contraindicação 2"],
  "cuidadosFarmaceuticos": ["orientação ao paciente 1", "orientação 2", "orientação 3"],
  "posologiaAdulto": "Dose e frequência para adultos",
  "posologiaPediatrica": "Dose pediátrica se aplicável, ou null",
  "receitaNecessaria": "Tipo de receita: nenhuma | simples | antimicrobiano | controle_especial_c1 | notificacao_azul | notificacao_amarela",
  "retencaoReceita": "Não retém | Retém 2ª via | Retém 1 via | Retém notificação",
  "validadeReceita": "Validade em dias ou texto",
  "interacoesImportantes": ["interação relevante 1", "interação 2"],
  "gravidezLactacao": "Orientação resumida sobre uso na gravidez/lactação",
  "efeitosAdversos": ["efeito adverso comum 1", "efeito 2"],
  "observacoesFarmacias": "Observação prática para o farmacêutico no balcão"
}

Responda SOMENTE com o JSON. Sem explicações.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Limpa markdown se vier
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.warn('[AI] Gemini error:', err.message);
    throw err;
  }
}

// ──────────────────────────────────────
// Render
// ──────────────────────────────────────

export function render() {
  return /* html */ `
    <div class="p-4 space-y-4">
      <!-- Title -->
      <div class="animate-fade-in">
        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
          <i data-lucide="search" class="w-5 h-5 text-emerald-600"></i>
          Busca de Medicamentos
        </h2>
        <p class="text-xs text-gray-500 mt-1">Indicações, cuidados, receita necessária e orientações ao paciente.</p>
      </div>

      <!-- Search Input -->
      <div class="relative animate-fade-in">
        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
        </div>
        <input
          type="search"
          id="busca-med-input"
          class="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none bg-white shadow-sm"
          placeholder="Ex: Amoxicilina, Ibuprofeno, Omeprazol..."
          value="${currentQuery}"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        ${currentQuery ? `
          <button id="busca-clear-btn" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        ` : ''}
      </div>

      <!-- AI Status Banner -->
      ${renderAIStatusBanner()}

      <!-- Results -->
      <div id="busca-results">
        ${renderResults()}
      </div>
    </div>
  `;
}

function renderAIStatusBanner() {
  const hasKey = window.FARMAAPP_GEMINI_KEY || (!GEMINI_API_KEY.includes('your_key_here') && GEMINI_API_KEY.length > 10);

  if (!currentQuery) return '';

  if (isLoadingAI) {
    return /* html */ `
      <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium animate-fade-in">
        <div class="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        Consultando Gemini AI para "${currentQuery}"...
      </div>
    `;
  }

  if (aiError) {
    return /* html */ `
      <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 animate-fade-in">
        <i data-lucide="wifi-off" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5"></i>
        <span><strong>IA indisponível:</strong> ${aiError} — exibindo base local.</span>
      </div>
    `;
  }

  if (!hasKey && currentQuery) {
    return /* html */ `
      <div class="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 animate-fade-in">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-purple-400"></i>
        <span>Configure sua <a href="#" id="config-ai-btn" class="text-purple-600 font-semibold underline">chave Gemini AI</a> para consultas ilimitadas de qualquer medicamento.</span>
      </div>
    `;
  }

  return '';
}

function renderResults() {
  if (!currentQuery) {
    return /* html */ `
      <div class="text-center py-12 animate-fade-in">
        <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="pill" class="w-8 h-8 text-emerald-300"></i>
        </div>
        <p class="text-sm text-gray-400 font-medium">Digite o nome de um medicamento</p>
        <p class="text-xs text-gray-300 mt-1">ou princípio ativo para buscar</p>
        <div class="mt-4 flex flex-wrap gap-2 justify-center">
          ${['Omeprazol', 'Amoxicilina', 'Losartana', 'Metformina', 'Dipirona'].map(m => `
            <button class="busca-sugestao text-xs bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700 px-3 py-1.5 rounded-full transition-all" data-med="${m}">${m}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (aiResult) {
    return renderAICard(aiResult);
  }

  if (localResults.length === 0) {
    return /* html */ `
      <div class="text-center py-10 animate-fade-in">
        <i data-lucide="search-x" class="w-12 h-12 text-gray-200 mx-auto mb-3"></i>
        <p class="text-sm text-gray-400 font-medium">Nenhum resultado local para</p>
        <p class="text-sm font-bold text-gray-600">"${currentQuery}"</p>
        <p class="text-xs text-gray-400 mt-2">Configure o Gemini AI para buscar qualquer medicamento.</p>
      </div>
    `;
  }

  return localResults.map((med, i) => renderLocalMedCard(med, i)).join('');
}

function getReceitaInfo(lista) {
  const map = {
    'livre': { label: 'Sem Receita (MIP)', color: 'green', icon: 'unlock' },
    'antimicrobiano': { label: 'Receita Antimicrobiano (RDC 20)', color: 'blue', icon: 'file-text' },
    'simples': { label: 'Receita Simples', color: 'blue', icon: 'file-text' },
    'C1': { label: 'Receita Controle Especial Branca', color: 'amber', icon: 'lock' },
    'C5': { label: 'Receita Branca (Lista C5)', color: 'amber', icon: 'lock' },
    'B1': { label: 'Notificação Azul (B1)', color: 'blue', icon: 'shield' },
    'B2': { label: 'Notificação Azul (B2)', color: 'blue', icon: 'shield' },
    'A1': { label: 'Notificação Amarela (A1)', color: 'amber', icon: 'shield' },
    'A2': { label: 'Notificação Amarela (A2)', color: 'amber', icon: 'shield' },
  };
  return map[lista] || { label: lista || 'Verificar', color: 'gray', icon: 'help-circle' };
}

function getReceitaInfoFromAI(tipo) {
  const map = {
    'nenhuma': { label: 'Sem Receita (MIP)', color: 'green', icon: 'unlock' },
    'simples': { label: 'Receita Simples', color: 'blue', icon: 'file-text' },
    'antimicrobiano': { label: 'Receita Antimicrobiano (RDC 20)', color: 'blue', icon: 'file-text' },
    'controle_especial_c1': { label: 'Receita Controle Especial Branca', color: 'amber', icon: 'lock' },
    'notificacao_azul': { label: 'Notificação Azul (B1/B2)', color: 'blue', icon: 'shield' },
    'notificacao_amarela': { label: 'Notificação Amarela (A1/A2/A3)', color: 'amber', icon: 'shield' },
  };
  return map[tipo] || { label: tipo, color: 'gray', icon: 'help-circle' };
}

function badgeColor(color) {
  const map = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return map[color] || map.gray;
}

function renderLocalMedCard(med, i) {
  const receita = getReceitaInfo(med.lista);

  return /* html */ `
    <div class="pharma-card space-y-4 animate-fade-in" style="animation-delay: ${i * 0.05}s">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="bg-emerald-100 rounded-xl p-2.5 flex-shrink-0">
          <i data-lucide="pill" class="w-5 h-5 text-emerald-700"></i>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-bold text-sm text-gray-800 leading-tight">${med.nome}</h3>
          <p class="text-xs text-emerald-700 font-semibold mt-0.5">${med.principioAtivo}</p>
          <p class="text-[0.7rem] text-gray-500 mt-0.5">${med.classe}</p>
        </div>
      </div>

      <!-- Receita Badge -->
      <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
        <i data-lucide="${receita.icon}" class="w-4 h-4 flex-shrink-0 ${receita.color === 'green' ? 'text-emerald-600' : receita.color === 'amber' ? 'text-amber-600' : 'text-blue-600'}"></i>
        <div>
          <p class="text-[0.65rem] uppercase tracking-wider font-bold text-gray-400">Prescrição Necessária</p>
          <p class="text-xs font-bold text-gray-800">${receita.label}</p>
        </div>
        <span class="ml-auto text-[0.65rem] font-bold px-2 py-0.5 rounded-full border ${badgeColor(receita.color)}">${med.forma}</span>
      </div>

      <!-- Indicações -->
      ${med.indicacoes?.length ? /* html */ `
        <div>
          <h4 class="section-label">✅ Indicações</h4>
          <ul class="space-y-1 mt-1">
            ${med.indicacoes.map(ind => `
              <li class="text-xs text-gray-700 flex items-start gap-2">
                <span class="text-emerald-500 flex-shrink-0 mt-0.5">•</span>${ind}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Posologia -->
      <div class="bg-emerald-50 rounded-xl p-3 space-y-2">
        <h4 class="section-label text-emerald-800">💊 Posologia</h4>
        ${med.posologiaAdulto ? `
          <div>
            <p class="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider">Adulto</p>
            <p class="text-xs text-gray-800 mt-0.5 font-medium leading-relaxed">${med.posologiaAdulto}</p>
          </div>
        ` : ''}
        ${med.posologiaPediatrica ? `
          <div>
            <p class="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider">Pediátrica</p>
            <p class="text-xs text-gray-800 mt-0.5 font-medium leading-relaxed">${med.posologiaPediatrica}</p>
          </div>
        ` : ''}
      </div>

      <!-- Contraindicações -->
      ${med.contraindicacoes?.length ? /* html */ `
        <div>
          <h4 class="section-label">⛔ Contraindicações e Cuidados</h4>
          <ul class="space-y-1 mt-1">
            ${med.contraindicacoes.map(c => `
              <li class="text-xs text-red-700 flex items-start gap-2 bg-red-50 rounded-lg px-2.5 py-1.5">
                <span class="flex-shrink-0 mt-0.5">⚠️</span>${c}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Observações -->
      ${med.observacoes ? /* html */ `
        <div class="border-l-4 border-emerald-400 pl-3 bg-emerald-50/50 py-2 rounded-r-xl">
          <h4 class="section-label text-emerald-800">🏪 Orientação no Balcão</h4>
          <p class="text-xs text-gray-700 mt-1 leading-relaxed">${med.observacoes}</p>
        </div>
      ` : ''}

      <!-- Source badge -->
      <div class="flex items-center gap-1.5 text-[0.65rem] text-gray-400 pt-1 border-t border-gray-100">
        <i data-lucide="database" class="w-3 h-3"></i>
        <span>Base local FarmaApp</span>
      </div>
    </div>
  `;
}

function renderAICard(ai) {
  const receita = getReceitaInfoFromAI(ai.receitaNecessaria);

  return /* html */ `
    <div class="pharma-card space-y-4 animate-fade-in border-purple-200 border">
      <!-- AI Badge -->
      <div class="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-2.5">
        <div class="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <i data-lucide="sparkles" class="w-4 h-4 text-purple-600"></i>
        </div>
        <div>
          <p class="text-[0.65rem] font-bold text-purple-700 uppercase tracking-wider">Gemini AI · Farmacêutico Digital</p>
          <p class="text-[0.65rem] text-gray-400">Informações geradas por IA — confirme com bula oficial</p>
        </div>
      </div>

      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="bg-emerald-100 rounded-xl p-2.5 flex-shrink-0">
          <i data-lucide="pill" class="w-5 h-5 text-emerald-700"></i>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-bold text-sm text-gray-800 leading-tight">${ai.nome || currentQuery}</h3>
          <p class="text-xs text-emerald-700 font-semibold mt-0.5">${ai.principioAtivo || ''}</p>
          <p class="text-[0.7rem] text-gray-500 mt-0.5">${ai.classe || ''}</p>
        </div>
      </div>

      <!-- Receita Necessária -->
      <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
        <i data-lucide="${receita.icon}" class="w-5 h-5 flex-shrink-0 ${receita.color === 'green' ? 'text-emerald-600' : receita.color === 'amber' ? 'text-amber-600' : 'text-blue-600'}"></i>
        <div class="flex-1">
          <p class="text-[0.65rem] uppercase tracking-wider font-bold text-gray-400">Prescrição Necessária</p>
          <p class="text-xs font-bold text-gray-800">${receita.label}</p>
          ${ai.validadeReceita ? `<p class="text-[0.65rem] text-gray-500 mt-0.5">Validade: ${ai.validadeReceita}</p>` : ''}
          ${ai.retencaoReceita ? `<p class="text-[0.65rem] text-gray-500">Retenção: ${ai.retencaoReceita}</p>` : ''}
        </div>
      </div>

      <!-- Indicações -->
      ${ai.indicacoes?.length ? /* html */ `
        <div>
          <h4 class="section-label">✅ Indicações</h4>
          <ul class="space-y-1 mt-1">
            ${ai.indicacoes.map(ind => `
              <li class="text-xs text-gray-700 flex items-start gap-2">
                <span class="text-emerald-500 flex-shrink-0 mt-0.5">•</span>${ind}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Posologia -->
      <div class="bg-emerald-50 rounded-xl p-3 space-y-2">
        <h4 class="section-label text-emerald-800">💊 Posologia</h4>
        ${ai.posologiaAdulto ? `
          <div>
            <p class="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider">Adulto</p>
            <p class="text-xs text-gray-800 mt-0.5 font-medium leading-relaxed">${ai.posologiaAdulto}</p>
          </div>
        ` : ''}
        ${ai.posologiaPediatrica ? `
          <div>
            <p class="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider">Pediátrica</p>
            <p class="text-xs text-gray-800 mt-0.5 font-medium leading-relaxed">${ai.posologiaPediatrica}</p>
          </div>
        ` : ''}
      </div>

      <!-- Cuidados Farmacêuticos -->
      ${ai.cuidadosFarmaceuticos?.length ? /* html */ `
        <div class="bg-blue-50 rounded-xl p-3 space-y-2 border border-blue-100">
          <h4 class="section-label text-blue-800">🏥 Cuidados Farmacêuticos</h4>
          <ul class="space-y-1.5 mt-1">
            ${ai.cuidadosFarmaceuticos.map(c => `
              <li class="text-xs text-blue-900 flex items-start gap-2">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5"></i>${c}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Efeitos Adversos -->
      ${ai.efeitosAdversos?.length ? /* html */ `
        <div>
          <h4 class="section-label">⚠️ Efeitos Adversos Comuns</h4>
          <div class="flex flex-wrap gap-1.5 mt-1">
            ${ai.efeitosAdversos.map(e => `
              <span class="text-[0.7rem] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">${e}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Contraindicações -->
      ${ai.contraindicacoes?.length ? /* html */ `
        <div>
          <h4 class="section-label">⛔ Contraindicações</h4>
          <ul class="space-y-1 mt-1">
            ${ai.contraindicacoes.map(c => `
              <li class="text-xs text-red-700 flex items-start gap-2 bg-red-50 rounded-lg px-2.5 py-1.5">
                <span class="flex-shrink-0 mt-0.5">⚠️</span>${c}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Interações -->
      ${ai.interacoesImportantes?.length ? /* html */ `
        <div class="bg-amber-50 rounded-xl p-3 border border-amber-200 space-y-2">
          <h4 class="section-label text-amber-800">🔄 Interações Importantes</h4>
          <ul class="space-y-1 mt-1">
            ${ai.interacoesImportantes.map(i => `
              <li class="text-xs text-amber-900 flex items-start gap-2">
                <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5"></i>${i}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Gravidez e Lactação -->
      ${ai.gravidezLactacao ? /* html */ `
        <div class="bg-pink-50 rounded-xl p-3 border border-pink-100">
          <h4 class="section-label text-pink-800">🤰 Gravidez e Lactação</h4>
          <p class="text-xs text-pink-900 mt-1 leading-relaxed">${ai.gravidezLactacao}</p>
        </div>
      ` : ''}

      <!-- Observação no Balcão -->
      ${ai.observacoesFarmacias ? /* html */ `
        <div class="border-l-4 border-emerald-400 pl-3 bg-emerald-50/50 py-2 rounded-r-xl">
          <h4 class="section-label text-emerald-800">🏪 Orientação no Balcão</h4>
          <p class="text-xs text-gray-700 mt-1 leading-relaxed">${ai.observacoesFarmacias}</p>
        </div>
      ` : ''}

      <!-- Source badge -->
      <div class="flex items-center gap-1.5 text-[0.65rem] text-purple-400 pt-1 border-t border-gray-100">
        <i data-lucide="sparkles" class="w-3 h-3"></i>
        <span>Gerado por Gemini 1.5 Flash — verifique sempre a bula oficial ANVISA</span>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────
// AI Config Modal
// ──────────────────────────────────────

function showConfigModal() {
  const existing = document.getElementById('ai-config-modal');
  if (existing) existing.remove();

  const savedKey = localStorage.getItem('farmaapp_gemini_key') || '';

  const modal = document.createElement('div');
  modal.id = 'ai-config-modal';
  modal.innerHTML = /* html */ `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in" id="ai-modal-backdrop">
      <div class="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-4 animate-slide-up shadow-2xl">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base text-gray-900 flex items-center gap-2">
            <i data-lucide="sparkles" class="w-5 h-5 text-purple-600"></i>
            Configurar Gemini AI
          </h3>
          <button id="ai-modal-close" class="text-gray-400 hover:text-gray-600">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="bg-purple-50 rounded-xl p-3 text-xs text-purple-800 space-y-1">
          <p class="font-bold">Como obter sua chave gratuita:</p>
          <ol class="list-decimal list-inside space-y-0.5 text-purple-700">
            <li>Acesse <strong>aistudio.google.com</strong></li>
            <li>Faça login com sua conta Google</li>
            <li>Clique em "Get API Key" → "Create API key"</li>
            <li>Copie e cole abaixo</li>
          </ol>
          <p class="text-purple-500 mt-1">Plano gratuito: 15 consultas/min, 1.500/dia, 0 custo.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">Sua Chave API do Gemini</label>
          <input
            type="text"
            id="ai-key-input"
            class="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 font-mono"
            placeholder="AIza..."
            value="${savedKey}"
          />
        </div>

        <div class="flex gap-2">
          <button id="ai-save-btn" class="flex-1 bg-purple-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-purple-700 transition-colors">
            Salvar e Ativar
          </button>
          ${savedKey ? `
            <button id="ai-clear-btn" class="bg-red-100 text-red-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-red-200 transition-colors">
              Remover
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();

  document.getElementById('ai-modal-close').onclick = () => modal.remove();
  document.getElementById('ai-modal-backdrop').onclick = (e) => { if (e.target === e.currentTarget) modal.remove(); };

  document.getElementById('ai-save-btn').onclick = () => {
    const key = document.getElementById('ai-key-input').value.trim();
    if (key && key.startsWith('AIza')) {
      localStorage.setItem('farmaapp_gemini_key', key);
      window.FARMAAPP_GEMINI_KEY = key;
      modal.remove();
      if (currentQuery) triggerAISearch(currentQuery);
    } else {
      alert('Chave inválida. Deve começar com "AIza".');
    }
  };

  const clearBtn = document.getElementById('ai-clear-btn');
  if (clearBtn) {
    clearBtn.onclick = () => {
      localStorage.removeItem('farmaapp_gemini_key');
      window.FARMAAPP_GEMINI_KEY = null;
      modal.remove();
      refreshUI();
    };
  }
}

// ──────────────────────────────────────
// Search Logic
// ──────────────────────────────────────

async function doSearch(query) {
  currentQuery = query;
  aiResult = null;
  aiError = null;

  if (!query) {
    localResults = [];
    refreshUI();
    return;
  }

  // Search local DB
  localResults = await searchMedicamentos(query);

  // Try AI if key available
  const hasKey = window.FARMAAPP_GEMINI_KEY || (!GEMINI_API_KEY.includes('your_key_here') && GEMINI_API_KEY.length > 10);

  if (hasKey) {
    triggerAISearch(query);
  } else {
    refreshUI();
  }
}

function triggerAISearch(query) {
  clearTimeout(aiDebounceTimer);
  isLoadingAI = true;
  refreshUI();

  aiDebounceTimer = setTimeout(async () => {
    try {
      const result = await consultarGeminiAI(query);
      if (result) {
        aiResult = result;
        aiError = null;
      }
    } catch (err) {
      aiError = err.message || 'Erro de conexão';
      aiResult = null;
    } finally {
      isLoadingAI = false;
      refreshUI();
    }
  }, 800);
}

// ──────────────────────────────────────
// Init & Events
// ──────────────────────────────────────

export async function init() {
  // Load saved API key
  const savedKey = localStorage.getItem('farmaapp_gemini_key');
  if (savedKey) window.FARMAAPP_GEMINI_KEY = savedKey;

  bindEvents();

  if (currentQuery) {
    await doSearch(currentQuery);
  }
}

function bindEvents() {
  const input = document.getElementById('busca-med-input');
  const clearBtn = document.getElementById('busca-clear-btn');
  const configBtn = document.getElementById('config-ai-btn');

  let debounce = null;

  if (input) {
    input.addEventListener('input', (e) => {
      clearTimeout(debounce);
      const val = e.target.value.trim();
      debounce = setTimeout(() => doSearch(val), 350);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.target.value = '';
        doSearch('');
      }
    });
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      currentQuery = '';
      aiResult = null;
      localResults = [];
      refreshUI();
    };
  }

  if (configBtn) {
    configBtn.onclick = (e) => {
      e.preventDefault();
      showConfigModal();
    };
  }

  // Sugestões rápidas
  document.querySelectorAll('.busca-sugestao').forEach(btn => {
    btn.addEventListener('click', () => {
      const med = btn.dataset.med;
      const inp = document.getElementById('busca-med-input');
      if (inp) inp.value = med;
      doSearch(med);
    });
  });
}

function refreshUI() {
  const content = document.getElementById('module-content');
  if (!content) return;
  content.innerHTML = render();
  if (window.lucide) lucide.createIcons();
  bindEvents();
}

export function destroy() {
  clearTimeout(aiDebounceTimer);
  aiResult = null;
  aiError = null;
  isLoadingAI = false;
}
