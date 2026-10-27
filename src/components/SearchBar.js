// ========================================
// FarmaApp — SearchBar Component
// ========================================

/**
 * Renders a search input bar with magnifying glass icon.
 * @param {object} options
 * @param {string} [options.placeholder='Buscar medicamento...'] - Placeholder text.
 * @param {string} [options.id='search-input'] - Input element ID.
 * @param {string} [options.value=''] - Current value.
 * @returns {string} HTML string.
 */
export function render({
  placeholder = 'Buscar medicamento...',
  id = 'search-input',
  value = '',
} = {}) {
  return /* html */ `
    <div class="search-wrapper">
      <div class="search-icon" aria-hidden="true">
        <i data-lucide="search"></i>
      </div>
      <input
        type="search"
        id="${id}"
        class="search-input"
        placeholder="${placeholder}"
        value="${value}"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        aria-label="${placeholder}"
      />
    </div>
  `;
}

/**
 * Attaches a debounced input listener that dispatches a custom 'search' event.
 * @param {string} inputId - The ID of the search input.
 * @param {number} [debounceMs=250] - Debounce delay in ms.
 * @param {Function} [callback] - Optional direct callback instead of event.
 */
export function init(inputId = 'search-input', debounceMs = 250, callback = null) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let timer = null;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();

      if (callback) {
        callback(query);
      } else {
        input.dispatchEvent(new CustomEvent('search', {
          bubbles: true,
          detail: { query },
        }));
      }
    }, debounceMs);
  });
}
