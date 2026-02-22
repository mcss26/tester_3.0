#!/usr/bin/env node
/**
 * Testing Pipeline Tracker — CLI
 * Muestra estado de observaciones, tickets y planes desde terminal.
 *
 * Uso:
 *   node scripts/testing-tracker.js              → resumen general
 *   node scripts/testing-tracker.js --tickets    → lista todos los tickets
 *   node scripts/testing-tracker.js --open       → solo tickets abiertos
 *   node scripts/testing-tracker.js --obs        → lista observaciones
 */

const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..", "docs", "testing");
const DIRS = {
  observations: path.join(BASE, "observations"),
  tickets: path.join(BASE, "tickets"),
  plans: path.join(BASE, "plans"),
};

// ── Colores ANSI ──────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
};

function severityColor(sev) {
  if (sev.includes("🔴") || sev.toLowerCase().includes("crit")) return C.red;
  if (sev.includes("🟡") || sev.toLowerCase().includes("medio")) return C.yellow;
  if (sev.includes("🟢") || sev.toLowerCase().includes("bajo")) return C.green;
  return C.white;
}

function statusColor(status) {
  const s = status.toLowerCase();
  if (s.includes("cerrado") || s.includes("ejecutado")) return C.green;
  if (s.includes("plan")) return C.cyan;
  if (s.includes("abierto")) return C.yellow;
  return C.white;
}

// ── Parsers ───────────────────────────────────────────────────
function listMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => path.join(dir, f));
}

function parseTicket(filepath) {
  const content = fs.readFileSync(filepath, "utf8");
  const name = path.basename(filepath, ".md");

  const extract = (label) => {
    const regex = new RegExp(`>\\s*\\*\\*${label}\\*\\*:\\s*(.+)`, "i");
    const match = content.match(regex);
    return match ? match[1].trim() : "—";
  };

  return {
    file: name,
    agent: extract("Agente\\(s\\)"),
    severity: extract("Severidad"),
    tier: extract("Tier"),
    status: extract("Estado"),
  };
}

function parseObservation(filepath) {
  const content = fs.readFileSync(filepath, "utf8");
  const name = path.basename(filepath, ".md");
  const obsCount = (content.match(/^### OBS-/gm) || []).length;
  const crits = (content.match(/🔴/g) || []).length;
  const mediums = (content.match(/🟡/g) || []).length;
  const lows = (content.match(/🟢/g) || []).length;

  return { file: name, total: obsCount, crits, mediums, lows };
}

// ── Vistas ────────────────────────────────────────────────────
function showSummary() {
  const obs = listMdFiles(DIRS.observations).map(parseObservation);
  const tix = listMdFiles(DIRS.tickets).map(parseTicket);
  const plans = listMdFiles(DIRS.plans);

  const totalObs = obs.reduce((a, o) => a + o.total, 0);
  const totalCrits = obs.reduce((a, o) => a + o.crits, 0);
  const totalMed = obs.reduce((a, o) => a + o.mediums, 0);
  const totalLow = obs.reduce((a, o) => a + o.lows, 0);

  const openTix = tix.filter((t) => t.status.toLowerCase().includes("abierto")).length;
  const plannedTix = tix.filter((t) => t.status.toLowerCase().includes("plan")).length;
  const closedTix = tix.filter(
    (t) => t.status.toLowerCase().includes("cerrado") || t.status.toLowerCase().includes("ejecutado")
  ).length;

  console.log("");
  console.log(`${C.bold}${C.cyan}  ╔══════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ║   🧪  TESTING PIPELINE — FormulaMid 4   ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ╚══════════════════════════════════════════╝${C.reset}`);
  console.log("");

  console.log(`${C.bold}  📝 Observaciones${C.reset}`);
  console.log(`     Pantallas revisadas:  ${C.bold}${obs.length}${C.reset}`);
  console.log(`     Hallazgos totales:    ${C.bold}${totalObs}${C.reset}`);
  console.log(`       ${C.red}🔴 Críticos: ${totalCrits}${C.reset}`);
  console.log(`       ${C.yellow}🟡 Medios:   ${totalMed}${C.reset}`);
  console.log(`       ${C.green}🟢 Bajos:    ${totalLow}${C.reset}`);
  console.log("");

  console.log(`${C.bold}  🎫 Tickets${C.reset}`);
  console.log(`     Total:       ${C.bold}${tix.length}${C.reset}`);
  console.log(`       ${C.yellow}Abiertos:    ${openTix}${C.reset}`);
  console.log(`       ${C.cyan}En Plan:     ${plannedTix}${C.reset}`);
  console.log(`       ${C.green}Cerrados:    ${closedTix}${C.reset}`);
  console.log("");

  console.log(`${C.bold}  📋 Planes${C.reset}`);
  console.log(`     Generados:   ${C.bold}${plans.length}${C.reset}`);
  console.log("");

  console.log(`${C.dim}  Usa --tickets, --open, o --obs para detalle${C.reset}`);
  console.log("");
}

function showTickets(filterOpen = false) {
  const tix = listMdFiles(DIRS.tickets).map(parseTicket);
  const filtered = filterOpen
    ? tix.filter((t) => !t.status.toLowerCase().includes("cerrado") && !t.status.toLowerCase().includes("ejecutado"))
    : tix;

  if (filtered.length === 0) {
    console.log(`\n${C.dim}  Sin tickets${filterOpen ? " abiertos" : ""}.${C.reset}\n`);
    return;
  }

  console.log(`\n${C.bold}  🎫 Tickets${filterOpen ? " Abiertos" : ""}${C.reset}\n`);
  console.log(`  ${"ID".padEnd(30)} ${"Agente".padEnd(15)} ${"Sev".padEnd(5)} ${"Tier".padEnd(8)} Estado`);
  console.log(`  ${C.dim}${"─".repeat(75)}${C.reset}`);

  for (const t of filtered) {
    const sc = severityColor(t.severity);
    const stc = statusColor(t.status);
    console.log(
      `  ${t.file.padEnd(30)} ${t.agent.padEnd(15)} ${sc}${t.severity.padEnd(5)}${C.reset} ${t.tier.padEnd(8)} ${stc}${t.status}${C.reset}`
    );
  }
  console.log("");
}

function showObservations() {
  const obs = listMdFiles(DIRS.observations).map(parseObservation);

  if (obs.length === 0) {
    console.log(`\n${C.dim}  Sin observaciones registradas.${C.reset}\n`);
    return;
  }

  console.log(`\n${C.bold}  📝 Observaciones por Pantalla${C.reset}\n`);
  console.log(`  ${"Pantalla".padEnd(30)} ${"Total".padEnd(7)} ${C.red}🔴${C.reset}    ${C.yellow}🟡${C.reset}    ${C.green}🟢${C.reset}`);
  console.log(`  ${C.dim}${"─".repeat(55)}${C.reset}`);

  for (const o of obs) {
    console.log(
      `  ${o.file.padEnd(30)} ${String(o.total).padEnd(7)} ${C.red}${String(o.crits).padEnd(5)}${C.reset} ${C.yellow}${String(o.mediums).padEnd(5)}${C.reset} ${C.green}${o.lows}${C.reset}`
    );
  }
  console.log("");
}

// ── Main ──────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes("--tickets")) {
  showTickets(false);
} else if (args.includes("--open")) {
  showTickets(true);
} else if (args.includes("--obs")) {
  showObservations();
} else {
  showSummary();
}
