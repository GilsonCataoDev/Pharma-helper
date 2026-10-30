// ========================================
// FarmaApp — Dexie Database Module
// ========================================

/* global Dexie */

/** @type {Dexie} */
let db;

/**
 * Get or create the Dexie database instance.
 * @returns {Dexie}
 */
export function getDB() {
  if (db) return db;

  db = new Dexie('FarmaAppDB');

  db.version(2).stores({
    medicamentos: '++id, nome, principioAtivo, tipo, classe, forma, concentracao, lista',
    equivalencias: '++id, referencia, generico, principioAtivo, forma, concentracao',
    interacoes: '++id, med1, med2, severidade, descricao, recomendacao',
    receitasRegras: '++id, tipo, codigo, lista, retencao, validade, quantidadeMax',
    conferencias: '++id, data, distribuidora, nf, itens, status, observacoes',
  });

  return db;
}

// ──────────────────────────────────────
// Helper: Safe JSON loader with relative base
// ──────────────────────────────────────
async function loadJsonData(filename) {
  // Build URL candidates from most to least reliable:
  // 1. Relative to the module's own location (src/db/ → src/data/)
  // 2. Relative to <base href> or document URL root
  const candidates = [];

  try {
    // Module-relative: this file is at src/db/database.js → data is at src/data/
    candidates.push(new URL(`../data/${filename}`, import.meta.url).href);
  } catch (_) { /* import.meta.url unavailable in some non-standard runtimes */ }

  try {
    // Document-root fallback: always place data at /src/data/ from the origin
    const docBase = document.querySelector('base')?.href || window.location.origin + '/';
    candidates.push(new URL(`src/data/${filename}`, docBase).href);
  } catch (_) { /* ignore */ }

  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn(`[DB] Could not load JSON from ${url}:`, err);
    }
  }

  return null;
}

// ──────────────────────────────────────
// Seed Functions
// ──────────────────────────────────────

export async function seedEquivalencias() {
  const database = getDB();
  const count = await database.equivalencias.count();
  if (count === 0) {
    const fromJson = await loadJsonData('equivalencias.json');
    if (fromJson && Array.isArray(fromJson) && fromJson.length > 0) {
      // Flatten into searchable rows if necessary
      const rows = [];
      fromJson.forEach(item => {
        (item.concentracoes || [item.concentracao || '']).forEach(conc => {
          (item.genericos || [item.generico || 'Genérico']).forEach(gen => {
            rows.push({
              referencia: item.referencia,
              generico: typeof gen === 'string' ? gen : gen.nome,
              principioAtivo: item.principioAtivo,
              forma: item.forma,
              concentracao: conc
            });
          });
        });
      });
      await database.equivalencias.bulkAdd(rows);
      console.log('[DB] Seeded equivalencias from JSON:', rows.length);
      return;
    }

    // Fallback seed
    await database.equivalencias.bulkAdd([
      { referencia: 'Novalgina', principioAtivo: 'Dipirona Sódica', generico: 'Dipirona Sódica Genérico', forma: 'Comprimido', concentracao: '500mg' },
      { referencia: 'Tylenol', principioAtivo: 'Paracetamol', generico: 'Paracetamol Genérico', forma: 'Comprimido', concentracao: '750mg' },
      { referencia: 'Advil', principioAtivo: 'Ibuprofeno', generico: 'Ibuprofeno Genérico', forma: 'Cápsula', concentracao: '400mg' },
      { referencia: 'Amoxil', principioAtivo: 'Amoxicilina', generico: 'Amoxicilina Genérico', forma: 'Cápsula', concentracao: '500mg' },
      { referencia: 'Clavulin', principioAtivo: 'Amoxicilina + Clavulanato', generico: 'Amoxicilina + Clavulanato Genérico', forma: 'Comprimido', concentracao: '875mg + 125mg' },
      { referencia: 'Losec / Peprazol', principioAtivo: 'Omeprazol', generico: 'Omeprazol Genérico', forma: 'Cápsula', concentracao: '20mg' },
      { referencia: 'Cozaar / Aradois', principioAtivo: 'Losartana Potássica', generico: 'Losartana Potássica Genérico', forma: 'Comprimido', concentracao: '50mg' },
      { referencia: 'Glifage', principioAtivo: 'Metformina', generico: 'Cloridrato de Metformina Genérico', forma: 'Comprimido', concentracao: '850mg' },
      { referencia: 'Rivotril', principioAtivo: 'Clonazepam', generico: 'Clonazepam Genérico', forma: 'Comprimido', concentracao: '2mg' },
      { referencia: 'Zoloft', principioAtivo: 'Sertralina', generico: 'Cloridrato de Sertralina Genérico', forma: 'Comprimido', concentracao: '50mg' }
    ]);
  }
}

export async function seedReceitasRegras() {
  const database = getDB();
  const count = await database.receitasRegras.count();
  if (count === 0) {
    const fromJson = await loadJsonData('receitas-regras.json');
    if (fromJson && Array.isArray(fromJson) && fromJson.length > 0) {
      await database.receitasRegras.bulkAdd(fromJson);
      console.log('[DB] Seeded receitasRegras from JSON:', fromJson.length);
      return;
    }

    await database.receitasRegras.bulkAdd([
      {
        tipo: 'Receita Simples (Branca 1 via)',
        codigo: 'simples',
        lista: 'Medicamentos isentos e de venda sob prescrição sem retenção',
        retencao: 'Não retém',
        validade: 30,
        quantidadeMax: 'Conforme prescrição',
        itensObrigatorios: [
          'Nome completo do paciente',
          'Data da prescrição',
          'Nome do medicamento (DCB/DCI)',
          'Concentração / dosagem',
          'Quantidade e forma',
          'Posologia clara',
          'Nome do prescritor',
          'Número de inscrição no conselho (CRM/CRO)',
          'Assinatura do prescritor'
        ]
      },
      {
        tipo: 'Receita Antimicrobianos (RDC 20/2011)',
        codigo: 'antimicrobiano',
        lista: 'Antimicrobianos',
        retencao: 'Retém 2ª via',
        validade: 10,
        quantidadeMax: 'Tratamento completo prescrito',
        itensObrigatorios: [
          'Nome e idade/sexo do paciente',
          'Data da prescrição (máx. 10 dias)',
          'Nome do medicamento (DCB)',
          'Dosagem, quantidade e forma',
          'Posologia com duração do tratamento',
          'Identificação do emitente (CRM/CRO)',
          'Assinatura e carimbo',
          'Receita em 2 vias',
          'Dados do comprador no verso'
        ]
      },
      {
        tipo: 'Receita de Controle Especial (Branca 2 vias)',
        codigo: 'C1_C5',
        lista: 'Lista C1 e C5',
        retencao: 'Retém 1 via',
        validade: 30,
        quantidadeMax: 'Até 60 dias de tratamento',
        itensObrigatorios: [
          'Nome completo do paciente',
          'Endereço completo do paciente',
          'Data da prescrição',
          'Nome do medicamento (DCB)',
          'Quantidade em algarismos e por extenso',
          'Posologia detalhada',
          'Nome, CRM e endereço do prescritor',
          'Assinatura legível do médico',
          'Identificação do comprador completa com RG/CPF'
        ]
      },
      {
        tipo: 'Notificação de Receita Azul (B1/B2)',
        codigo: 'B1_B2',
        lista: 'Lista B1 (Psicotrópicos) e B2 (Anorexígenos)',
        retencao: 'Retém a notificação azul',
        validade: 30,
        quantidadeMax: 'Até 60 dias (B1) / 30 dias (B2)',
        itensObrigatorios: [
          'Formulário azul oficial com número tipográfico',
          'Nome e endereço residencial do paciente',
          'Data da prescrição',
          'Nome do fármaco (DCB), dose e forma',
          'Quantidade em algarismos e por extenso',
          'Posologia',
          'Nome, CRM e assinatura do prescritor',
          'Identificação da gráfica emissora autorizada',
          'Identificação do comprador preenchida no verso'
        ]
      },
      {
        tipo: 'Notificação de Receita Amarela (A1/A2/A3)',
        codigo: 'A1_A2_A3',
        lista: 'Lista A1, A2 (Entorpecentes) e A3 (Estimulantes)',
        retencao: 'Retém a notificação amarela',
        validade: 30,
        quantidadeMax: 'Até 30 dias de tratamento',
        itensObrigatorios: [
          'Talonário amarelo oficial fornecido pela Vigilância Sanitária',
          'Número da notificação e sigla da UF',
          'Nome e endereço do paciente',
          'Data da prescrição',
          'Medicamento (DCB) e quantidade por extenso',
          'Posologia',
          'Assinatura do médico cadastrado na VISA',
          'Dados da gráfica e autorização sanitária',
          'Identificação minuciosa do comprador com RG/CPF'
        ]
      }
    ]);
  }
}

export async function seedMedicamentos() {
  const database = getDB();
  const count = await database.medicamentos.count();
  if (count === 0) {
    const fromJson = await loadJsonData('medicamentos.json');
    if (fromJson && Array.isArray(fromJson) && fromJson.length > 0) {
      await database.medicamentos.bulkAdd(fromJson);
      console.log('[DB] Seeded medicamentos from JSON:', fromJson.length);
    }
  }
}

export async function seedInteracoes() {
  const database = getDB();
  const count = await database.interacoes.count();
  if (count === 0) {
    const fromJson = await loadJsonData('interacoes.json');
    if (fromJson && Array.isArray(fromJson) && fromJson.length > 0) {
      await database.interacoes.bulkAdd(fromJson);
      console.log('[DB] Seeded interacoes from JSON:', fromJson.length);
    }
  }
}

/**
 * Seed all tables.
 */
export async function seedAll() {
  await seedEquivalencias();
  await seedReceitasRegras();
  await seedMedicamentos();
  await seedInteracoes();
}

// ──────────────────────────────────────
// Query Helpers
// ──────────────────────────────────────

/**
 * Search equivalencias by query string.
 */
export async function searchEquivalencias(query, formaFilter = '') {
  const database = getDB();
  let results = await database.equivalencias.toArray();

  if (query) {
    const q = query.toLowerCase().trim();
    results = results.filter((item) =>
      (item.referencia && item.referencia.toLowerCase().includes(q)) ||
      (item.generico && item.generico.toLowerCase().includes(q)) ||
      (item.principioAtivo && item.principioAtivo.toLowerCase().includes(q))
    );
  }

  if (formaFilter) {
    const f = formaFilter.toLowerCase().trim();
    results = results.filter((item) => item.forma && item.forma.toLowerCase().includes(f));
  }

  return results;
}

export async function getReceitasRegras() {
  const database = getDB();
  return database.receitasRegras.toArray();
}

export async function getFormasFarmaceuticas() {
  const database = getDB();
  const all = await database.equivalencias.toArray();
  const formas = [...new Set(all.map((e) => e.forma).filter(Boolean))];
  return formas.sort();
}

/**
 * Search medications catalog.
 */
export async function searchMedicamentos(query, classeFilter = '') {
  const database = getDB();
  let results = await database.medicamentos.toArray();

  if (query) {
    const q = query.toLowerCase().trim();
    results = results.filter((item) =>
      (item.nome && item.nome.toLowerCase().includes(q)) ||
      (item.principioAtivo && item.principioAtivo.toLowerCase().includes(q)) ||
      (item.classe && item.classe.toLowerCase().includes(q)) ||
      (item.indicacoes && item.indicacoes.some(ind => ind.toLowerCase().includes(q)))
    );
  }

  if (classeFilter) {
    const c = classeFilter.toLowerCase().trim();
    results = results.filter((item) => item.classe && item.classe.toLowerCase().includes(c));
  }

  return results;
}

/**
 * Check pairwise interactions for an array of medication active ingredient names.
 */
export async function checkInteracoes(drugsList) {
  if (!drugsList || drugsList.length < 2) return [];
  const database = getDB();
  const allInteractions = await database.interacoes.toArray();

  const found = [];
  const normalized = drugsList.map(d => d.toLowerCase().trim());

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const d1 = normalized[i];
      const d2 = normalized[j];

      const matches = allInteractions.filter(item => {
        const med1 = (item.med1 || '').toLowerCase().trim();
        const med2 = (item.med2 || '').toLowerCase().trim();
        // Require minimum length to avoid single-letter false positives
        if (med1.length < 3 || med2.length < 3) return false;
        // Use word-boundary style check: each drug name must be a substring of the other
        // but the DB entry must be specific enough (not just a letter match)
        const matchFwd = (
          (med1.includes(d1) || d1.includes(med1)) &&
          (med2.includes(d2) || d2.includes(med2))
        );
        const matchRev = (
          (med1.includes(d2) || d2.includes(med1)) &&
          (med2.includes(d1) || d1.includes(med2))
        );
        return matchFwd || matchRev;
      });

      matches.forEach(m => {
        if (!found.some(existing => existing.id === m.id)) {
          found.push(m);
        }
      });
    }
  }

  return found;
}

export async function getAllInteracoes() {
  const database = getDB();
  return database.interacoes.toArray();
}

// ──────────────────────────────────────
// Conferência de Pedidos Helpers
// ──────────────────────────────────────

export async function getConferencias() {
  const database = getDB();
  return database.conferencias.orderBy('id').reverse().toArray();
}

export async function addConferencia(registro) {
  const database = getDB();
  return database.conferencias.add({
    ...registro,
    data: registro.data || new Date().toISOString()
  });
}

export async function deleteConferencia(id) {
  const database = getDB();
  return database.conferencias.delete(id);
}
