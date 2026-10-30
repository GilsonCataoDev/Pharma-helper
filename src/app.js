// ========================================
// FarmaApp — Main Application Entry Point
// ========================================

import * as Header from './components/Header.js';
import * as NavBar from './components/NavBar.js';
import { seedAll } from './db/database.js';

// ──────────────────────────────────────
// Route Registry
// ──────────────────────────────────────

/**
 * Map of hash routes to module paths (lazy-loaded).
 */
const ROUTES = {
  '#/':             () => import('./modules/home/index.js'),
  '#/receitas':     () => import('./modules/receitas/index.js'),
  '#/equivalencia': () => import('./modules/equivalencia/index.js'),
  '#/interacoes':   () => import('./modules/interacoes/index.js'),
  '#/pedidos':      () => import('./modules/pedidos/index.js'),
  '#/indicacoes':   () => import('./modules/indicacoes/index.js'),
  '#/calculadora':  () => import('./modules/calculadora/index.js'),
  '#/busca':        () => import('./modules/busca/index.js'),
};

/** Currently loaded module reference (for cleanup). */
let currentModule = null;

// ──────────────────────────────────────
// Router
// ──────────────────────────────────────

/**
 * Get current hash or default to '#/'.
 */
function getCurrentHash() {
  return window.location.hash || '#/';
}

/**
 * Reinitialize Lucide icons exactly once per navigation cycle.
 * Calling createIcons() multiple times stacks hidden spans — call once after
 * all HTML is settled.
 */
function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

/**
 * Navigate to a route — renders layout + module content.
 */
async function navigate() {
  const hash = getCurrentHash();
  const app = document.getElementById('app');
  if (!app) return;

  // Cleanup previous module
  if (currentModule && typeof currentModule.destroy === 'function') {
    currentModule.destroy();
    currentModule = null;
  }

  // Render the layout shell (header + content + navbar)
  app.innerHTML = `
    ${Header.render(hash)}
    <main class="app-content" id="module-content" role="main">
      <div class="flex items-center justify-center p-8" style="min-height: 40vh;">
        <div class="text-gray-300">
          <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-emerald-600"></i>
        </div>
      </div>
    </main>
    ${NavBar.render(hash)}
  `;

  // Initialize navbar (more menu toggle) + icon pass for shell
  NavBar.init();
  refreshIcons(); // ← single icon pass for the shell

  // Load the module
  const contentEl = document.getElementById('module-content');
  const routeLoader = ROUTES[hash] || ROUTES['#/'];

  try {
    const moduleImport = await routeLoader();
    const mod = moduleImport.default || moduleImport;
    currentModule = mod;

    // Render module content
    contentEl.innerHTML = mod.render();

    // Call module init for event listeners (init may re-render internally)
    if (typeof mod.init === 'function') {
      await mod.init();
    }

    // Single icon pass after module is fully settled
    refreshIcons();
  } catch (err) {
    console.error('[App] Failed to load module:', err);
    contentEl.innerHTML = /* html */ `
      <div class="flex flex-col items-center justify-center text-center p-8" style="min-height: 40vh;">
        <i data-lucide="alert-octagon" class="w-12 h-12 text-red-400 mb-3"></i>
        <p class="text-sm text-gray-700 font-semibold">Erro ao carregar módulo</p>
        <p class="text-xs text-gray-400 mt-1">${err.message}</p>
        <a href="#/" class="mt-4 text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl">Voltar ao início</a>
      </div>
    `;
    refreshIcons();
  }
}

// ──────────────────────────────────────
// Service Worker Registration
// ──────────────────────────────────────

async function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    try {
      const swUrl = new URL('sw.js', window.location.href).href;
      const reg = await navigator.serviceWorker.register(swUrl);
      console.log('[App] Service Worker registered:', reg.scope);
    } catch (err) {
      console.warn('[App] Service Worker registration failed:', err);
    }
  }
}

// ──────────────────────────────────────
// App Initialization
// ──────────────────────────────────────

async function initApp() {
  console.log('[App] FarmaApp starting...');

  // Seed the database
  try {
    await seedAll();
    console.log('[App] Database seeded successfully.');
  } catch (err) {
    console.warn('[App] Database seed error:', err);
  }

  // Set default hash if none
  if (!window.location.hash) {
    window.location.hash = '#/';
  }

  // Listen for hash changes
  window.addEventListener('hashchange', navigate);

  // Initial render
  await navigate();

  // Register service worker after first render (non-blocking)
  registerServiceWorker();

  console.log('[App] FarmaApp ready!');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
