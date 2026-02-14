/**
 * MOCK-DATA.JS — Workdays Planner
 * Single source of truth for prototype data.
 */

/* ── State Machine ── */
export const STATES = {
  DRAFT: 'DRAFT',
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

export const STATE_META = {
  DRAFT:     { label: 'Pre-Producción', class: 'draft',     color: '#FFBC00' },
  PLANNED:   { label: 'Planificado',    class: 'planned',   color: '#3B82F6' },
  ACTIVE:    { label: 'En Vivo',        class: 'active',    color: '#22C55E' },
  CLOSED:    { label: 'Cerrado',        class: 'closed',    color: '#71717A' },
  CANCELLED: { label: 'Cancelado',      class: 'cancelled', color: '#EF4444' },
};

/* ── Staff Plan by Area ── */
export const staffPlan = [
  {
    area: 'Barra',
    roles: [
      { name: 'Bartender', count: 4, rate: 18000 },
      { name: 'Barback',   count: 2, rate: 12000 },
      { name: 'Barra VIP', count: 1, rate: 22000 },
    ],
  },
  {
    area: 'Puerta',
    roles: [
      { name: 'Seguridad',    count: 3, rate: 15000 },
      { name: 'Acreditadores', count: 2, rate: 10000 },
      { name: 'RRPP',         count: 2, rate: 12000 },
    ],
  },
  {
    area: 'Caja',
    roles: [
      { name: 'Cajero',    count: 1, rate: 16000 },
      { name: 'Boletería', count: 1, rate: 14000 },
    ],
  },
  {
    area: 'Producción',
    roles: [
      { name: 'DJ / Técnico', count: 1, rate: 35000 },
      { name: 'Iluminación',  count: 1, rate: 18000 },
      { name: 'Sonido',       count: 1, rate: 20000 },
    ],
  },
  {
    area: 'Operativo',
    roles: [
      { name: 'Limpieza',      count: 2, rate: 10000 },
      { name: 'Mantenimiento', count: 1, rate: 12000 },
    ],
  },
];

/* ── Fixed Costs (source_type: RECURRENTE) ── */
export const fixedCosts = [
  { id: 1, name: 'Alquiler Proporcional', amount: 85000, paid: true },
  { id: 2, name: 'Energía Eléctrica',     amount: 32000, paid: false },
  { id: 3, name: 'SADAIC / Música',        amount: 18000, paid: false },
  { id: 4, name: 'AADICAPIF',              amount: 12000, paid: true },
  { id: 5, name: 'Seguro Noche',           amount: 12000, paid: false },
];

/* ── Solicitudes (from operational modules) ── */
export const solicitudes = [
  { id: 1, name: 'Hielo extra (200kg)',      amount: 40000, origin: 'Barra',  status: 'Aprobada' },
  { id: 2, name: 'Vasos descartables ×500',  amount: 15000, origin: 'Barra',  status: 'Pendiente' },
  { id: 3, name: 'Seguridad adicional ×2',   amount: 30000, origin: 'Puerta', status: 'Aprobada' },
  { id: 4, name: 'Sillas extra VIP ×10',     amount: 8000,  origin: 'Oper.',  status: 'Entregada' },
  { id: 5, name: 'Flyers impresos ×200',     amount: 6000,  origin: 'Admin',  status: 'Pendiente' },
];

/* ── Eventos ── */
export const eventos = [
  { id: 1, name: 'Noche Electrónica',  qr_count: 400 },
  { id: 2, name: 'House Sessions',      qr_count: 350 },
  { id: 3, name: 'Reggaetón Night',     qr_count: 500 },
  { id: 4, name: 'Viernes Clásico',     qr_count: 280 },
  { id: 5, name: 'Noche Latina',        qr_count: 320 },
];

/* ── Workday rows ── */
export const workdays = [
  { id: 42, date: 'Sáb 15 Feb', status: STATES.DRAFT,     event: null,               target: new Date('2026-02-16T00:00:00') },
  { id: 41, date: 'Vie 14 Feb', status: STATES.ACTIVE,    event: 'House Sessions',    target: null },
  { id: 40, date: 'Sáb 08 Feb', status: STATES.CLOSED,    event: 'Reggaetón Night',   target: null },
  { id: 39, date: 'Vie 07 Feb', status: STATES.CLOSED,    event: 'Viernes Clásico',   target: null },
  { id: 38, date: 'Sáb 01 Feb', status: STATES.CLOSED,    event: 'Noche Latina',      target: null },
  { id: 37, date: 'Vie 31 Ene', status: STATES.CANCELLED, event: null,                target: null },
];

/* ── KPI Helpers ── */
export function calcAreaTotal(area) {
  return area.roles.reduce((sum, r) => sum + r.count * r.rate, 0);
}

export function calcAreaHeadcount(area) {
  return area.roles.reduce((sum, r) => sum + r.count, 0);
}

export function calcStaffKpis() {
  let total = 0, headcount = 0;
  staffPlan.forEach(a => {
    total += calcAreaTotal(a);
    headcount += calcAreaHeadcount(a);
  });
  return { total, headcount };
}

export function calcFixedTotal() {
  return fixedCosts.reduce((sum, c) => sum + c.amount, 0);
}

export function calcFixedPaidCount() {
  return fixedCosts.filter(c => c.paid).length;
}

export function calcSolicitudesTotal() {
  return solicitudes.reduce((sum, s) => sum + s.amount, 0);
}

export function formatCurrency(n) {
  return '$' + n.toLocaleString('es-AR');
}
