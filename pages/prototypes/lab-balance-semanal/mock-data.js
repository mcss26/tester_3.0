/**
 * Mock Data — Balance Semanal v4
 * Simula 4 semanas con datos realistas de un nightclub.
 * Fuentes reales: vw_finance_weekly, vw_daily_sales, revenue_details,
 * consumption_details, finance_payments, staff_accruals, cost_config,
 * reporte_Zoco (liquidación digital), stg_gbol_items.
 */

// ─── Parámetros Fiscales (cost_config) ──────────────────────────
const FISCAL_PARAMS = {
    iva: 0.21,
    iibb: 0.035,   // Ingresos Brutos provincial
    municipal: 0.012,
    ganancias: 0.05, // Estimado sobre utilidad neta
    // Fees por canal digital (Zoco)
    fees: {
        debito:  { arancel: 0.008, anticipo: 0, txCost: 0 },
        credito: { arancel: 0.03,  anticipo: 0.01, txCost: 0 },
        qr:      { arancel: 0.006, anticipo: 0, txCost: 15 },
    }
};

// ─── Semanas Disponibles ────────────────────────────────────────
const WEEKS = [
    { id: 'w1', label: 'Sem 1 — 3 Feb a 10 Feb', start: '2026-02-03', end: '2026-02-10' },
    { id: 'w2', label: 'Sem 2 — 27 Ene a 3 Feb', start: '2026-01-27', end: '2026-02-03' },
    { id: 'w3', label: 'Sem 3 — 20 Ene a 27 Ene', start: '2026-01-20', end: '2026-01-27' },
    { id: 'w4', label: 'Sem 4 — 13 Ene a 20 Ene', start: '2026-01-13', end: '2026-01-20' },
];

// ─── Noches por Semana (detalle diario) ─────────────────────────
// Cada noche = 1 workday cerrado con cash_closing + bar_session + revenue_report
function generateNights(weekId) {
    const base = {
        w1: [
            { date: '2026-02-07', event: 'Viernes Regular', attendance: 420, cashSystem: 985000, cashDeclared: 982500, zocoSystem: 312000, zocoDeclared: 312000, barSales: 1150000, qrIncome: 147000 },
            { date: '2026-02-08', event: 'Sábado Noche Latina', attendance: 680, cashSystem: 1620000, cashDeclared: 1614000, zocoSystem: 498000, zocoDeclared: 498000, barSales: 1870000, qrIncome: 238000 },
        ],
        w2: [
            { date: '2026-01-31', event: 'Viernes Regular', attendance: 390, cashSystem: 910000, cashDeclared: 908500, zocoSystem: 285000, zocoDeclared: 283200, barSales: 1050000, qrIncome: 132000 },
            { date: '2026-02-01', event: 'Sábado Fiesta UV', attendance: 750, cashSystem: 1780000, cashDeclared: 1773000, zocoSystem: 545000, zocoDeclared: 545000, barSales: 2050000, qrIncome: 275000 },
        ],
        w3: [
            { date: '2026-01-24', event: 'Viernes Reggaeton', attendance: 410, cashSystem: 960000, cashDeclared: 957000, zocoSystem: 298000, zocoDeclared: 296500, barSales: 1100000, qrIncome: 140000 },
            { date: '2026-01-25', event: 'Sábado Electro', attendance: 620, cashSystem: 1480000, cashDeclared: 1476000, zocoSystem: 462000, zocoDeclared: 462000, barSales: 1710000, qrIncome: 210000 },
        ],
        w4: [
            { date: '2026-01-17', event: 'Viernes Regular', attendance: 350, cashSystem: 820000, cashDeclared: 818000, zocoSystem: 255000, zocoDeclared: 253000, barSales: 940000, qrIncome: 118000 },
            { date: '2026-01-18', event: 'Sábado Summer Fest', attendance: 890, cashSystem: 2100000, cashDeclared: 2092000, zocoSystem: 650000, zocoDeclared: 650000, barSales: 2420000, qrIncome: 320000 },
        ],
    };
    return base[weekId] || base.w1;
}

// ─── Cruce de Stock (Recetas → SKU → Costo) ────────────────────
// Simula: revenue_details × master_recipes.ingredients × master_sku.costo
// vs consumption_details × master_sku.costo
function generateStockCross(weekId) {
    const data = {
        w1: {
            // CMV Teórico = lo que debería haberse consumido según ventas × recetas
            cmvTeorico: 385000,
            // CMV Real = lo que realmente se consumió según conteo físico
            cmvReal: 402000,
            // Merma = Real - Teórico (positivo = pérdida)
            merma: 17000,
            mermaPct: 4.4, // %
            // Free drinks valorizados (q_sin_cargo × costo receta)
            freeDrinksCost: 28500,
            freeDrinksQty: 142,
            // VIP drinks (q_vip × costo receta)
            vipDrinksCost: 12000,
            vipDrinksQty: 45,
            // Top ítems con merma
            topMerma: [
                { sku: 'Fernet Branca 750ml', teorico: 18, real: 21, delta: 3, costo: 4200, perdida: 12600 },
                { sku: 'Speed Lata', teorico: 340, real: 348, delta: 8, costo: 450, perdida: 3600 },
                { sku: 'Vodka Smirnoff 750ml', teorico: 8, real: 8.5, delta: 0.5, costo: 3800, perdida: 1900 },
            ],
        },
        w2: { cmvTeorico: 410000, cmvReal: 418000, merma: 8000, mermaPct: 1.9, freeDrinksCost: 32000, freeDrinksQty: 158, vipDrinksCost: 15000, vipDrinksQty: 55, topMerma: [] },
        w3: { cmvTeorico: 365000, cmvReal: 378000, merma: 13000, mermaPct: 3.6, freeDrinksCost: 24000, freeDrinksQty: 118, vipDrinksCost: 9500, vipDrinksQty: 38, topMerma: [] },
        w4: { cmvTeorico: 420000, cmvReal: 445000, merma: 25000, mermaPct: 5.9, freeDrinksCost: 35000, freeDrinksQty: 170, vipDrinksCost: 18000, vipDrinksQty: 68, topMerma: [] },
    };
    return data[weekId] || data.w1;
}

// ─── Ingresos Digitales (Zoco) con Desfase ─────────────────────
// Simula: reporte_Zoco con Fecha OP vs Fecha Pago
function generateDigitalIncome(weekId) {
    const data = {
        w1: {
            brutoTerminal: 312000,  // closing_terminals.system_zoco
            brutoZoco: 318500,      // Reporte Zoco: SUM(Bruto) de la semana
            // Desglose de descuentos Zoco
            arancel: 6370,
            ivaArancel: 1338,
            costoFinanciero: 3185,
            retencionIIBB: 1115,
            retencionGanancias: 0,
            retencionIVA: 0,
            netoAcreditar: 306492,  // Lo que realmente llega a la cuenta
            // Desfase temporal
            acreditadoEstaSemana: 285000,  // De operaciones de ESTA semana
            pendienteAcreditar: 21492,     // Llega la próxima semana
            acreditadoDeSemanasAnteriores: 18000, // De semanas pasadas que cayeron AHORA
        },
        w2: { brutoTerminal: 545000, brutoZoco: 551200, arancel: 11024, ivaArancel: 2315, costoFinanciero: 5512, retencionIIBB: 1929, retencionGanancias: 0, retencionIVA: 0, netoAcreditar: 530420, acreditadoEstaSemana: 498000, pendienteAcreditar: 32420, acreditadoDeSemanasAnteriores: 24500 },
        w3: { brutoTerminal: 462000, brutoZoco: 467800, arancel: 9356, ivaArancel: 1965, costoFinanciero: 4678, retencionIIBB: 1637, retencionGanancias: 0, retencionIVA: 0, netoAcreditar: 450164, acreditadoEstaSemana: 425000, pendienteAcreditar: 25164, acreditadoDeSemanasAnteriores: 15200 },
        w4: { brutoTerminal: 650000, brutoZoco: 658400, arancel: 13168, ivaArancel: 2765, costoFinanciero: 6584, retencionIIBB: 2304, retencionGanancias: 0, retencionIVA: 0, netoAcreditar: 633579, acreditadoEstaSemana: 590000, pendienteAcreditar: 43579, acreditadoDeSemanasAnteriores: 31200 },
    };
    return data[weekId] || data.w1;
}

// ─── Egresos Semanales (categorizados) ──────────────────────────
function generateExpenses(weekId) {
    const data = {
        w1: {
            staff: 320000,       // staff_accruals
            compras: 185000,     // supplier_orders (mercadería)
            insumosOp: 42000,    // finance_payments category=operativa (descartables, limpieza)
            freeDrinks: 28500,   // (calculado desde stock cross)
            merma: 17000,        // (calculado desde stock cross)
            licencias: 25000,    // SADAIC, derechos, seguros
            costosFijos: 85000,  // Alquiler, servicios, internet
            extras: 12000,       // Pagos no categorizados
            // IVA Crédito (de compras con Factura A)
            ivaCreditoFiscal: 38850, // 21% de compras netas
        },
        w2: { staff: 380000, compras: 210000, insumosOp: 48000, freeDrinks: 32000, merma: 8000, licencias: 25000, costosFijos: 85000, extras: 8500, ivaCreditoFiscal: 44100 },
        w3: { staff: 290000, compras: 170000, insumosOp: 38000, freeDrinks: 24000, merma: 13000, licencias: 25000, costosFijos: 85000, extras: 15000, ivaCreditoFiscal: 35700 },
        w4: { staff: 410000, compras: 240000, insumosOp: 55000, freeDrinks: 35000, merma: 25000, licencias: 25000, costosFijos: 85000, extras: 5000, ivaCreditoFiscal: 50400 },
    };
    return data[weekId] || data.w1;
}

// ─── Discrepancias ──────────────────────────────────────────────
function generateDiscrepancies(weekId) {
    const data = {
        w1: [
            { area: 'Caja General', delta: -2500, responsible: 'Martín L.', date: '2026-02-07', type: 'cash' },
            { area: 'Caja General', delta: -6000, responsible: 'Lucía R.', date: '2026-02-08', type: 'cash' },
        ],
        w2: [
            { area: 'Caja General', delta: -1500, responsible: 'Martín L.', date: '2026-01-31', type: 'cash' },
            { area: 'Caja General', delta: -7000, responsible: 'Juan P.', date: '2026-02-01', type: 'cash' },
            { area: 'Zoco vs Terminal', delta: -1800, responsible: 'Sistema', date: '2026-01-31', type: 'digital' },
        ],
        w3: [],  // Sin discrepancias
        w4: [
            { area: 'Caja General', delta: -2000, responsible: 'Martín L.', date: '2026-01-17', type: 'cash' },
            { area: 'Caja General', delta: -8000, responsible: 'Ana S.', date: '2026-01-18', type: 'cash' },
        ],
    };
    return data[weekId] || [];
}

// ─── Gráfico Histórico (12 semanas) ─────────────────────────────
const CHART_HISTORY = [
    { week: 'S44', income: 2150000, expenses: 1680000, merma: 18000 },
    { week: 'S45', income: 2380000, expenses: 1750000, merma: 22000 },
    { week: 'S46', income: 1950000, expenses: 1520000, merma: 12000 },
    { week: 'S47', income: 2600000, expenses: 1890000, merma: 28000 },
    { week: 'S48', income: 2420000, expenses: 1810000, merma: 15000 },
    { week: 'S49', income: 2180000, expenses: 1650000, merma: 20000 },
    { week: 'S50', income: 2750000, expenses: 2010000, merma: 32000 },
    { week: 'S51', income: 3100000, expenses: 2250000, merma: 24000 },
    { week: 'S1', income: 2200000, expenses: 1700000, merma: 14000 },
    { week: 'S2', income: 2820000, expenses: 2100000, merma: 25000 },
    { week: 'S3', income: 2690000, expenses: 1920000, merma: 8000 },
    { week: 'S4', income: 3050000, expenses: 2240000, merma: 17000 },
];

// ─── Documentos ─────────────────────────────────────────────────
const DOCUMENTS = [
    { id: 1, name: 'Liquidación Zoco - Feb W1', type: 'xlsx', size: '245 KB', date: '2026-02-10' },
    { id: 2, name: 'Fact. A — Proveedor Bebidas', type: 'pdf', size: '120 KB', date: '2026-02-08' },
    { id: 3, name: 'Ticket SADAIC', type: 'pdf', size: '45 KB', date: '2026-02-05' },
];

// ─── Helper: Calcular totales semanales ─────────────────────────
function getWeekSummary(weekId) {
    const nights = generateNights(weekId);
    const stock = generateStockCross(weekId);
    const digital = generateDigitalIncome(weekId);
    const expenses = generateExpenses(weekId);
    const discrepancies = generateDiscrepancies(weekId);

    // Efectivo bruto = SUM(cashSystem) de todas las noches
    const cashBruto = nights.reduce((s, n) => s + n.cashSystem, 0);
    const cashDeclared = nights.reduce((s, n) => s + n.cashDeclared, 0);
    const cashDelta = cashDeclared - cashBruto;
    const totalBarSales = nights.reduce((s, n) => s + n.barSales, 0);
    const totalQR = nights.reduce((s, n) => s + n.qrIncome, 0);
    const totalAttendance = nights.reduce((s, n) => s + n.attendance, 0);

    // Ingreso total bruto
    const incomeBruto = cashBruto + digital.brutoZoco + totalQR;

    // Impuestos sobre ingresos
    const ivaVentas = incomeBruto * FISCAL_PARAMS.iva / (1 + FISCAL_PARAMS.iva); // IVA incluido
    const iibb = (incomeBruto - ivaVentas) * FISCAL_PARAMS.iibb;
    const municipal = (incomeBruto - ivaVentas) * FISCAL_PARAMS.municipal;
    const totalImpuestosIngresos = ivaVentas + iibb + municipal;

    // Ingreso neto (después de impuestos)
    const incomeNeto = incomeBruto - totalImpuestosIngresos;

    // Total egresos brutos
    const totalEgresosBruto = expenses.staff + expenses.compras + expenses.insumosOp +
        expenses.freeDrinks + expenses.merma + expenses.licencias +
        expenses.costosFijos + expenses.extras;

    // Egresos netos (descontando crédito fiscal IVA)
    const totalEgresosNeto = totalEgresosBruto - expenses.ivaCreditoFiscal;

    // Resultado operativo (pre-ganancias)
    const resultadoOperativo = incomeNeto - totalEgresosNeto;

    // Impuesto a las ganancias (sobre utilidad neta)
    const impGanancias = resultadoOperativo > 0 
        ? resultadoOperativo * FISCAL_PARAMS.ganancias 
        : 0;

    // Resultado final limpio
    const resultadoFinal = resultadoOperativo - impGanancias;
    const margenPct = incomeBruto > 0 ? (resultadoFinal / incomeBruto * 100) : 0;

    return {
        weekId,
        nights,
        stock,
        digital,
        expenses,
        discrepancies,
        // Totales calculados
        cashBruto,
        cashDeclared,
        cashDelta,
        totalBarSales,
        totalQR,
        totalAttendance,
        incomeBruto,
        // Impuestos
        ivaVentas: Math.round(ivaVentas),
        iibb: Math.round(iibb),
        municipal: Math.round(municipal),
        totalImpuestosIngresos: Math.round(totalImpuestosIngresos),
        incomeNeto: Math.round(incomeNeto),
        // Egresos
        totalEgresosBruto,
        totalEgresosNeto,
        // Resultado
        resultadoOperativo: Math.round(resultadoOperativo),
        impGanancias: Math.round(impGanancias),
        resultadoFinal: Math.round(resultadoFinal),
        margenPct: margenPct.toFixed(1),
    };
}

// ─── Exports ────────────────────────────────────────────────────
window.MockData = {
    FISCAL_PARAMS,
    WEEKS,
    CHART_HISTORY,
    DOCUMENTS,
    generateNights,
    generateStockCross,
    generateDigitalIncome,
    generateExpenses,
    generateDiscrepancies,
    getWeekSummary,
};
