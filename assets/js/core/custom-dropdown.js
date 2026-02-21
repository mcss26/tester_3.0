/**
 * CustomDropdown — Progressive Enhancement for <select> elements
 * 
 * Auto-wraps native <select> with the styled .custom-dropdown component
 * from forms.css. The original <select> stays hidden as data store,
 * so existing JS business logic (event listeners, form submits) keeps working.
 *
 * Usage:
 *   - Any <select class="input"> or <select class="select"> → auto-enhanced on DOMContentLoaded
 *   - Or call CustomDropdown.enhance(selectElement) manually
 *   - Or call CustomDropdown.enhanceAll('select.custom') for bulk
 *   - Selects with class "u-hidden" are skipped (already paired with manual custom-dropdowns)
 *
 * @module core/custom-dropdown
 */

const CustomDropdown = (() => {
  'use strict';

  const CHEVRON_SVG = `<svg class="custom-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;

  /** @type {WeakSet<HTMLSelectElement>} Track enhanced selects */
  const enhanced = new WeakSet();

  /** @type {HTMLElement|null} Currently open dropdown */
  let activeDropdown = null;

  /* ── Core ──────────────────────────────────────────────────── */

  /**
   * Enhance a single <select> element.
   * @param {HTMLSelectElement} select
   * @returns {HTMLElement|null} The wrapper element, or null if skipped
   */
  function enhance(select) {
    if (!(select instanceof HTMLSelectElement)) return null;
    if (enhanced.has(select)) return select.closest('.custom-dropdown');

    // Build wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown';
    if (select.id) wrapper.dataset.for = select.id;

    // Transfer width hint from select if inline style exists
    if (select.style.width) wrapper.style.width = select.style.width;
    if (select.style.minWidth) wrapper.style.minWidth = select.style.minWidth;

    // Trigger button
    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const textSpan = document.createElement('span');
    textSpan.className = 'custom-dropdown-text';
    textSpan.textContent = _getSelectedText(select);

    trigger.innerHTML = '';
    trigger.appendChild(textSpan);
    trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

    // Menu
    const menu = document.createElement('div');
    menu.className = 'custom-dropdown-menu';
    menu.setAttribute('role', 'listbox');
    _buildOptions(select, menu);

    // Assemble
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    wrapper.appendChild(select);

    // Hide native select (keep in DOM for form data & events)
    select.style.position = 'absolute';
    select.style.opacity = '0';
    select.style.pointerEvents = 'none';
    select.style.height = '0';
    select.style.width = '0';
    select.style.overflow = 'hidden';
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    // Disabled state (CSS-driven via .is-disabled in forms.css)
    if (select.disabled) {
      wrapper.classList.add('is-disabled');
    }

    // ── Events ──

    // Toggle open/close
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (select.disabled) return;
      _toggle(wrapper, trigger, menu);
    });

    // Keyboard nav
    trigger.addEventListener('keydown', (e) => {
      if (select.disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _toggle(wrapper, trigger, menu);
      } else if (e.key === 'Escape') {
        _close(wrapper, trigger);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!wrapper.classList.contains('is-open')) {
          _open(wrapper, trigger, menu);
        }
        const options = menu.querySelectorAll('.custom-dropdown-option:not(.is-disabled)');
        const current = menu.querySelector('.custom-dropdown-option.is-selected');
        const idx = Array.from(options).indexOf(current);
        const next = e.key === 'ArrowDown'
          ? Math.min(idx + 1, options.length - 1)
          : Math.max(idx - 1, 0);
        if (options[next]) _selectOption(options[next], select, textSpan, wrapper, trigger);
      }
    });

    // Option click (delegated)
    menu.addEventListener('click', (e) => {
      const opt = e.target.closest('.custom-dropdown-option');
      if (!opt || opt.classList.contains('is-disabled')) return;
      _selectOption(opt, select, textSpan, wrapper, trigger);
    });

    // Sync if native select changes externally (JS sets .value)
    select.addEventListener('change', () => {
      _syncFromNative(select, menu, textSpan);
    });

    // MutationObserver: watch for <option> additions/removals
    const observer = new MutationObserver(() => {
      _buildOptions(select, menu);
      _syncFromNative(select, menu, textSpan);
    });
    observer.observe(select, { childList: true, subtree: true });

    enhanced.add(select);
    return wrapper;
  }

  /**
   * Enhance all selects matching a CSS selector.
   * @param {string} [selector='select.input, select.select, select.enhance']
   */
  function enhanceAll(selector = 'select.input, select.select, select.enhance') {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.tagName !== 'SELECT') return;
      // Skip hidden selects (already paired with manual custom-dropdowns)
      if (el.classList.contains('u-hidden')) return;
      enhance(el);
    });
  }

  /* ── Internals ─────────────────────────────────────────────── */

  function _getSelectedText(select) {
    const opt = select.options[select.selectedIndex];
    return opt ? opt.textContent.trim() : '';
  }

  function _buildOptions(select, menu) {
    menu.innerHTML = '';
    Array.from(select.options).forEach((opt) => {
      const div = document.createElement('div');
      div.className = 'custom-dropdown-option';
      div.dataset.value = opt.value;
      div.textContent = opt.textContent.trim();
      div.setAttribute('role', 'option');

      if (opt.selected) div.classList.add('is-selected');
      if (opt.disabled) {
        div.classList.add('is-disabled');
        div.style.opacity = '0.4';
        div.style.cursor = 'default';
      }
      menu.appendChild(div);
    });
  }

  function _selectOption(optDiv, select, textSpan, wrapper, trigger) {
    // Update visual
    optDiv.closest('.custom-dropdown-menu')
      .querySelectorAll('.custom-dropdown-option')
      .forEach(o => o.classList.remove('is-selected'));
    optDiv.classList.add('is-selected');
    textSpan.textContent = optDiv.textContent.trim();

    // Update native select (triggers existing listeners)
    const newValue = optDiv.dataset.value;
    if (select.value !== newValue) {
      select.value = newValue;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Close
    _close(wrapper, trigger);
  }

  function _syncFromNative(select, menu, textSpan) {
    const val = select.value;
    menu.querySelectorAll('.custom-dropdown-option').forEach(o => {
      o.classList.toggle('is-selected', o.dataset.value === val);
    });
    textSpan.textContent = _getSelectedText(select);
  }

  function _toggle(wrapper, trigger, menu) {
    if (wrapper.classList.contains('is-open')) {
      _close(wrapper, trigger);
    } else {
      _open(wrapper, trigger, menu);
    }
  }

  function _open(wrapper, trigger, menu) {
    // Close any other open dropdown first
    if (activeDropdown && activeDropdown !== wrapper) {
      const t = activeDropdown.querySelector('.custom-dropdown-trigger');
      _close(activeDropdown, t);
    }
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    activeDropdown = wrapper;

    // Scroll selected into view
    const selected = menu.querySelector('.is-selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function _close(wrapper, trigger) {
    wrapper.classList.remove('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (activeDropdown === wrapper) activeDropdown = null;
  }

  /* ── Global listeners (once) ───────────────────────────────── */

  // Click outside closes
  document.addEventListener('click', () => {
    if (activeDropdown) {
      const t = activeDropdown.querySelector('.custom-dropdown-trigger');
      _close(activeDropdown, t);
    }
  });

  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeDropdown) {
      const t = activeDropdown.querySelector('.custom-dropdown-trigger');
      _close(activeDropdown, t);
      t?.focus();
    }
  });

  /* ── Auto-init ─────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enhanceAll());
  } else {
    // Already loaded (deferred script)
    enhanceAll();
  }

  /* ── Public API ────────────────────────────────────────────── */

  return { enhance, enhanceAll };
})();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomDropdown;
}
