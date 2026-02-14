/**
 * APP.JS — Workdays Planner Interactions (Sprint A + Polish + Layout)
 * Progressive disclosure, payment toggles, staff lock, gated confirm,
 * toast notifications, cerrar modal, solicitudes accordion.
 */

import { eventos } from './mock-data.js';

/* =========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================= */

const TOAST_ICONS = {
  success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  danger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `wd-toast wd-toast--${type}`;
  toast.innerHTML = `
    <span class="wd-toast__icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('wd-toast--exiting');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* ── Countdown Timer (premium flip-clock structure) ── */
function updateCountdown() {
  const target = new Date('2026-02-16T00:00:00');
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) return;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  const blocks = document.querySelectorAll('.wd-countdown__block');
  if (blocks.length >= 4) {
    const vals = [
      { num: days, unit: 'D' },
      { num: hours, unit: 'H' },
      { num: mins, unit: 'M' },
      { num: secs, unit: 'S' },
    ];
    blocks.forEach((block, i) => {
      if (vals[i]) {
        block.innerHTML = `<span class="wd-countdown__num">${String(vals[i].num).padStart(2, '0')}</span><span class="wd-countdown__unit">${vals[i].unit}</span>`;
      }
    });
  }
}

/* ── Row Click → Expand/Collapse ── */
function setupRowToggle() {
  const rows = document.querySelectorAll('.wd-row[data-status="DRAFT"], .wd-row[data-status="PLANNED"]');

  rows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('button, select, .wd-pay-toggle')) return;

      const id = row.dataset.id;
      const panelRow = document.querySelector(`.wd-panel-row[data-panel-for="${id}"]`);
      if (!panelRow) return;

      const isExpanded = row.classList.contains('wd-row--expanded');

      document.querySelectorAll('.wd-row--expanded').forEach(r => {
        r.classList.remove('wd-row--expanded');
        r.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.wd-panel-row').forEach(p => p.style.display = 'none');

      if (!isExpanded) {
        row.classList.add('wd-row--expanded');
        row.setAttribute('aria-expanded', 'true');
        panelRow.style.display = '';
      }
    });
  });
}

/* ── Progressive Disclosure: Area Toggle (Staff + Solicitudes) ── */
function setupAreaToggle() {
  const areaHeaders = document.querySelectorAll('.wd-area__header');

  areaHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();

      const area = header.closest('.wd-area');
      const roles = area.querySelector('.wd-area__roles');
      const isCollapsed = area.classList.contains('wd-area--collapsed');

      if (isCollapsed) {
        area.classList.remove('wd-area--collapsed');
        area.classList.add('wd-area--expanded');
        header.setAttribute('aria-expanded', 'true');
        roles.hidden = false;
      } else {
        area.classList.remove('wd-area--expanded');
        area.classList.add('wd-area--collapsed');
        header.setAttribute('aria-expanded', 'false');
        roles.hidden = true;
      }
    });
  });
}

/* ── Payment Toggle (Costos) ── */
function setupPaymentToggles() {
  const toggles = document.querySelectorAll('.wd-pay-toggle');

  function updatePaidCount() {
    const total = toggles.length;
    const paid = document.querySelectorAll('.wd-pay-toggle--paid').length;
    const badge = document.querySelector('#card-costos .wd-badge-sm');
    if (badge) badge.textContent = `${paid}/${total} pagados`;
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const isPaid = btn.classList.contains('wd-pay-toggle--paid');

      if (isPaid) {
        btn.classList.remove('wd-pay-toggle--paid');
        btn.title = 'Pendiente';
        btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>`;
        btn.setAttribute('aria-label', 'Pendiente');
        showToast('Pago revertido', 'warning');
      } else {
        btn.classList.add('wd-pay-toggle--paid');
        btn.title = 'Pagado';
        btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
        btn.setAttribute('aria-label', 'Pagado');
        showToast('Marcado como pagado', 'success');
      }

      updatePaidCount();
    });
  });
}

/* ── Staff Confirm/Lock ── */
function setupStaffConfirm() {
  const confirmBtn = document.getElementById('btn-confirm-staff');
  const editBtn = document.getElementById('btn-edit-staff');
  const card = document.getElementById('card-staff');
  const headcount = document.getElementById('staff-headcount');

  if (!confirmBtn || !card) return;

  confirmBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    card.classList.add('wd-card--locked');
    confirmBtn.style.display = 'none';
    editBtn.textContent = 'Bloqueado';
    editBtn.disabled = true;
    if (headcount) {
      headcount.textContent = '22 convocados ✓';
      headcount.style.color = '#22C55E';
    }
    showToast('Staff confirmado — 22 personas', 'success');
  });
}

/* ── "Nueva Fecha" button ── */
function setupCreateButton() {
  const btn = document.getElementById('btn-new-date');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span>Creada</span>`;
    btn.disabled = true;
    showToast('Nueva jornada creada', 'success');
    setTimeout(() => {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Nueva Fecha</span>`;
      btn.disabled = false;
    }, 1500);
  });
}

/* ── Event Selector (now inline in the table row) → Gated Confirm ── */
function setupEventSelector() {
  const select = document.getElementById('evento-select');
  const kpiBadge = document.getElementById('kpi-badge');
  const confirmBtn = document.getElementById('btn-confirm-plan');
  if (!select) return;

  select.addEventListener('click', (e) => e.stopPropagation()); // prevent row toggle

  select.addEventListener('change', () => {
    const selectedEvento = eventos.find(e => e.id === Number(select.value));

    if (selectedEvento) {
      // Update KPI badge
      if (kpiBadge) kpiBadge.textContent = `${selectedEvento.qr_count} QRs`;

      // Enable confirm button (gated action)
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.title = 'Confirmar plan y pasar a PLANNED';
      }

      showToast(`Evento: ${selectedEvento.name}`, 'info');
    } else {
      if (kpiBadge) kpiBadge.textContent = '79%';
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.title = 'Seleccioná un evento para confirmar';
      }
    }
  });
}

/* ── Confirm Plan → Status Transition ── */
function setupConfirmPlan() {
  const btn = document.getElementById('btn-confirm-plan');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const row = document.querySelector('.wd-row[data-id="42"]');
    if (row) {
      row.dataset.status = 'PLANNED';
      const statusBadge = row.querySelector('.wd-status');
      if (statusBadge) {
        statusBadge.className = 'wd-status wd-status--planned';
        statusBadge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Planificado`;
      }
    }

    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Confirmado`;
    btn.disabled = true;
    showToast('Plan confirmado — estado: PLANIFICADO', 'success');
  });
}

/* ── Cerrar Noche Modal ── */
function setupCerrarModal() {
  // Target the cerrar button in the ACTIVE row specifically
  const activeRow = document.querySelector('.wd-row[data-status="ACTIVE"]');
  const cerrarBtn = activeRow?.querySelector('.wd-btn--danger');
  const modal = document.getElementById('modal-cerrar');
  const cancelBtn = document.getElementById('btn-modal-cancel');
  const confirmBtn = document.getElementById('btn-modal-confirm');

  if (!cerrarBtn || !modal) return;

  cerrarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.hidden = false;
  });

  cancelBtn?.addEventListener('click', () => {
    modal.hidden = true;
  });

  confirmBtn?.addEventListener('click', () => {
    modal.hidden = true;

    const row = document.querySelector('.wd-row[data-status="ACTIVE"]');
    if (row) {
      row.dataset.status = 'CLOSED';
      const statusBadge = row.querySelector('.wd-status');
      if (statusBadge) {
        statusBadge.className = 'wd-status wd-status--closed';
        statusBadge.innerHTML = 'Cerrada';
      }

      const actionsCell = row.querySelector('.wd-td--actions');
      if (actionsCell) {
        actionsCell.innerHTML = `
          <button class="wd-btn wd-btn--ghost" type="button" aria-label="Ver reporte" title="Ver reporte">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </button>
        `;
      }

      const countdownCell = row.querySelector('.wd-countdown-active');
      if (countdownCell) {
        countdownCell.innerHTML = '<span class="wd-closed-label">$1.180.000</span>';
      }
    }

    showToast('Noche cerrada — reportes generados', 'danger');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
  });
}

/* ── Init ── */
function init() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupRowToggle();
  setupAreaToggle();
  setupPaymentToggles();
  setupStaffConfirm();
  setupCreateButton();
  setupEventSelector();
  setupConfirmPlan();
  setupCerrarModal();
}

document.addEventListener('DOMContentLoaded', init);
